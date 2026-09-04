import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  assertExactMatch,
  createMultiCallTool,
  emptySchema,
  isValidWebMCPToolName,
  isWebMCPSupported,
  objectSchema,
  pollExactValue,
  readOptionalString,
  readRequiredInt,
  readRequiredString,
  readTargetList,
  registerWebMCPTools,
} from '@/lib/webmcp';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('webmcp helpers', () => {
  it('validates tool names per spec (1-128 chars, alnum + _.-)', () => {
    expect(isValidWebMCPToolName('join_room')).toBe(true);
    expect(isValidWebMCPToolName('set-room.code')).toBe(true);
    expect(isValidWebMCPToolName('')).toBe(false);
    expect(isValidWebMCPToolName('has space')).toBe(false);
    expect(isValidWebMCPToolName('emoji-🎉')).toBe(false);
    expect(isValidWebMCPToolName('a'.repeat(129))).toBe(false);
  });

  it('builds closed object schemas', () => {
    expect(objectSchema({ name: { type: 'string' } }, ['name'])).toEqual({
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
      additionalProperties: false,
    });
    expect(emptySchema()).toEqual({ type: 'object', properties: {}, additionalProperties: false });
  });

  it('reports unsupported when no modelContext exists', () => {
    expect(isWebMCPSupported()).toBe(false);
  });

  it('registerWebMCPTools is a safe no-op without support', async () => {
    await expect(
      registerWebMCPTools([{ name: 'join_room', description: 'x', execute: () => 'ok' }]),
    ).resolves.toBe(0);
  });

  it('registers via document.modelContext and honors abort', async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('document', { modelContext: { registerTool } });
    const controller = new AbortController();
    controller.abort();
    await expect(
      registerWebMCPTools([{ name: 'join_room', description: 'x', execute: () => 'ok' }], controller.signal),
    ).resolves.toBe(0);
    expect(registerTool).not.toHaveBeenCalled();
  });

  it('counts registered tools and skips invalid names', async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('document', { modelContext: { registerTool } });
    const count = await registerWebMCPTools([
      { name: 'join_room', description: 'Join', execute: () => 'ok' },
      { name: 'bad name!', description: 'Bad', execute: () => 'ok' },
    ]);
    expect(count).toBe(1);
    expect(registerTool).toHaveBeenCalledTimes(1);
  });

  it('accepts hyphenated tool names from the new scheme', () => {
    for (const name of ['modify_room-name_input', 'press_join-waiting_button', 'get_max-participant_input']) {
      expect(isValidWebMCPToolName(name), name).toBe(true);
    }
  });
});

describe('call_multi_function', () => {
  function setup() {
    const order: string[] = [];
    const executors = new Map<string, (args: unknown) => unknown>([
      ['modify_a_input', () => { order.push('a'); return 'A'; }],
      ['modify_b_input', (args: unknown) => { order.push('b'); return args; }],
      [
        'press_fail_button',
        () => {
          order.push('fail');
          throw new Error('boom');
        },
      ],
    ]);
    return { tool: createMultiCallTool(() => executors), order };
  }

  it('runs calls in order and collects results', async () => {
    const { tool } = setup();
    const result = (await tool.execute({
      calls: [
        { tool: 'modify_a_input', args: {} },
        { tool: 'modify_b_input', args: { value: 'x' } },
      ],
    }, {})) as { completed: unknown[]; failed: null; skipped: string[] };
    expect(result.failed).toBe(null);
    expect(result.skipped).toEqual([]);
    expect(result.completed).toEqual([
      { tool: 'modify_a_input', result: 'A' },
      { tool: 'modify_b_input', result: { value: 'x' } },
    ]);
  });

  it('stops at the first failure and reports skipped calls', async () => {
    const { tool, order } = setup();
    const result = (await tool.execute({
      calls: [{ tool: 'modify_a_input' }, { tool: 'press_fail_button' }, { tool: 'modify_b_input' }],
    }, {})) as { completed: unknown[]; failed: { tool: string; error: string }; skipped: string[] };
    expect(order).toEqual(['a', 'fail']);
    expect(result.completed).toEqual([{ tool: 'modify_a_input', result: 'A' }]);
    expect(result.failed).toEqual({ tool: 'press_fail_button', error: 'boom' });
    expect(result.skipped).toEqual(['modify_b_input']);
  });

  it('rejects self calls, unknown tools, and malformed input', async () => {
    const { tool } = setup();
    await expect(tool.execute({ calls: [{ tool: 'call_multi_function' }] }, {})).rejects.toThrow('itself');
    await expect(tool.execute({ calls: [{ tool: 'nope' }] }, {})).rejects.toThrow('Unknown tool');
    await expect(tool.execute({}, {})).rejects.toThrow('non-empty array');
    await expect(tool.execute({ calls: [] }, {})).rejects.toThrow('non-empty array');
  });
});

describe('exact-match guards', () => {
  it('reads optional/required strings without trimming', () => {
    expect(readOptionalString({}, 'value')).toBe(undefined);
    expect(readOptionalString({ value: '  Hi  ' }, 'value')).toBe('  Hi  ');
    expect(readRequiredString({ value: '  Hi  ' }, 'value')).toBe('  Hi  ');
    expect(() => readRequiredString({}, 'value')).toThrow('Provide "value"');
    expect(() => readOptionalString({ value: 42 }, 'value')).toThrow('"value" must be a string');
  });

  it('echoes received args and examples in errors', () => {
    expect(() => readRequiredString({}, 'value', 'e.g. {"value": "x"}')).toThrow('Received: {}');
    expect(() => readRequiredString({}, 'value', 'e.g. {"value": "x"}')).toThrow('e.g. {"value": "x"}');
    expect(() => readTargetList({ target: 42 }, 'target')).toThrow('Received: {"target":42}');
  });

  it('logs tool failures to console and rethrows', async () => {
    const registered: { execute: (args: unknown, options: unknown) => Promise<unknown> }[] = [];
    vi.stubGlobal('document', {
      modelContext: {
        registerTool: (tool: (typeof registered)[number]) => {
          registered.push(tool);
          return Promise.resolve();
        },
      },
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    try {
      await registerWebMCPTools([{
        name: 'boom_tool',
        description: 'Fails.',
        execute: () => { throw new Error('boom'); },
      }]);
      await expect(registered[0]?.execute({}, {})).rejects.toThrow('boom');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('[WebMCP] boom_tool failed: boom'));
    } finally {
      warn.mockRestore();
    }
  });

  it('assertExactMatch only passes on identical strings', () => {
    expect(() => { assertExactMatch('  Hi  ', '  Hi  ', 'before', 'Label'); }).not.toThrow();
    expect(() => { assertExactMatch('Hi', 'hi', 'before', 'Label'); }).toThrow('does not exactly match');
    expect(() => { assertExactMatch('Hi', ' Hi', 'target', 'Label'); }).toThrow('Nothing was changed');
    expect(() => { assertExactMatch('Hi', undefined, 'before', 'Label'); }).not.toThrow();
  });

  it('reads target as one string or an array, kept exactly', () => {
    expect(readTargetList({}, 'target')).toBe(null);
    expect(readTargetList({ target: 'Brief.PDF' }, 'target')).toEqual(['Brief.PDF']);
    expect(readTargetList({ target: ['a.pdf', 'B.pdf'] }, 'target')).toEqual(['a.pdf', 'B.pdf']);
    expect(readTargetList({ target: '' }, 'target')).toBe(null);
    expect(readTargetList({ target: [] }, 'target')).toBe(null);
    expect(() => readTargetList({ target: 42 }, 'target')).toThrow('must be a string or an array');
  });

  it('pollExactValue resolves on immediate and eventual exact match', async () => {
    await expect(pollExactValue(() => '  Hi  ', '  Hi  ', 'Label', 50)).resolves.toBe('  Hi  ');
    let calls = 0;
    const flipping = () => {
      calls += 1;
      return calls < 3 ? 'old' : 'new';
    };
    await expect(pollExactValue(flipping, 'new', 'Label', 500)).resolves.toBe('new');
    await expect(pollExactValue(() => 'old', 'new', 'Label', 60)).rejects.toThrow('but "new" was expected');
  });

  it('reads required integers with echo', () => {
    expect(readRequiredInt({ number: 3 }, 'number')).toBe(3);
    expect(() => readRequiredInt({}, 'number', 'e.g. {"number": 1}')).toThrow('Provide "number" as an integer');
    expect(() => readRequiredInt({ number: 1.5 }, 'number')).toThrow('Received: {"number":1.5}');
  });
});
