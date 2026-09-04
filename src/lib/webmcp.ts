// WebMCP registration helper — isolated, feature-detected, no secrets.
// Spec: https://webmachinelearning.github.io/webmcp/
// Chrome docs: https://developer.chrome.com/docs/ai/webmcp

export type WebMCPTool = WebMCPToolDefinition;

const TOOL_NAME_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

export function isValidWebMCPToolName(name: string): boolean {
  return TOOL_NAME_PATTERN.test(name);
}

export function objectSchema(
  properties: Record<string, Record<string, unknown>>,
  required: string[] = [],
): Record<string, unknown> {
  return {
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
    additionalProperties: false,
  };
}

export function emptySchema(): Record<string, unknown> {
  return { type: 'object', properties: {}, additionalProperties: false };
}

/**
 * Short safe echo of received args for error messages, so a caller whose
 * harness mangled the payload can see what actually arrived.
 */
export function summarizeArgs(args: unknown, maxLength = 200): string {
  try {
    const text = JSON.stringify(args) as string | undefined;
    if (typeof text !== 'string') return String(args);
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
  } catch {
    return '[unserializable args]';
  }
}

/**
 * Read an optional string field exactly as given (never trimmed).
 * Returns undefined when absent; throws when present but not a string.
 */
export function readOptionalString(args: unknown, field: string, hint = ''): string | undefined {
  if (typeof args !== 'object' || args === null) return undefined;
  if (!(field in args)) return undefined;
  const value = (args as Record<string, unknown>)[field];
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new Error(`"${field}" must be a string${hint ? `, ${hint}` : ''}. Received: ${summarizeArgs(args)}.`);
  }
  return value;
}

/** Read a required string field exactly as given (never trimmed). */
export function readRequiredString(args: unknown, field: string, hint = ''): string {
  const value = readOptionalString(args, field, hint);
  if (value === undefined) {
    throw new Error(`Provide "${field}" as a string${hint ? `, ${hint}` : ''}. Received: ${summarizeArgs(args)}.`);
  }
  return value;
}

/**
 * Exact-match guard for `before`/`target`: no-op when the guard is
 * undefined, otherwise throws without changing anything on mismatch.
 */
export function assertExactMatch(current: string, guard: string | undefined, kind: string, label: string): void {
  if (guard !== undefined && current !== guard) {
    throw new Error(`${label} is currently "${current}", which does not exactly match ${kind} "${guard}". Nothing was changed.`);
  }
}

/** Read a required integer field. Throws when missing or not an integer. */
export function readRequiredInt(args: unknown, field: string, hint = ''): number {
  if (typeof args === 'object' && args !== null && field in args) {
    const value = (args as Record<string, unknown>)[field];
    if (typeof value === 'number' && Number.isInteger(value)) return value;
  }
  throw new Error(`Provide "${field}" as an integer${hint ? `, ${hint}` : ''}. Received: ${summarizeArgs(args)}.`);
}

/**
 * Poll a getter until it returns exactly `expected` (never trimmed).
 * One macrotask is often not enough for React to flush state + ref effects,
 * so keep polling briefly instead of trusting a single read. Throws on timeout.
 */
export async function pollExactValue(
  get: () => string,
  expected: string,
  label: string,
  timeoutMs = 1000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  let current = get();
  while (current !== expected && Date.now() < deadline) {
    await new Promise((resolve) => { setTimeout(resolve, 25); });
    current = get();
  }
  if (current !== expected) throw new Error(`${label} is "${current}" but "${expected}" was expected.`);
  return current;
}

/**
 * Read a `target` that accepts one string or an array of strings.
 * Items are kept exactly (no trimming, case-sensitive). Returns null
 * when absent or empty. Throws on wrong types.
 */
export function readTargetList(args: unknown, field: string): string[] | null {
  if (typeof args !== 'object' || args === null) return null;
  if (!(field in args)) return null;
  const value = (args as Record<string, unknown>)[field];
  if (value === undefined || value === null) return null;
  const list = typeof value === 'string' ? [value] : value;
  if (!Array.isArray(list)) {
    throw new Error(`"${field}" must be a string or an array of strings. Received: ${summarizeArgs(args)}.`);
  }
  const items = list.map((item, index) => {
    if (typeof item !== 'string') throw new Error(`"${field}[${String(index)}]" must be a string. Received: ${summarizeArgs(args)}.`);
    return item;
  }).filter((item) => item.length > 0);
  return items.length > 0 ? items : null;
}

/** Feature detection: current `document.modelContext`, fallback legacy `navigator.modelContext`. */
export function getWebMCPContext(): WebMCPModelContext | null {
  try {
    if (typeof document !== 'undefined') {
      const fromDocument = document.modelContext;
      if (fromDocument && typeof fromDocument.registerTool === 'function') return fromDocument;
    }
    if (typeof navigator !== 'undefined') {
      const fromNavigator = navigator.modelContext;
      if (fromNavigator && typeof fromNavigator.registerTool === 'function') return fromNavigator;
    }
  } catch {
    return null;
  }
  return null;
}

export function isWebMCPSupported(): boolean {
  return getWebMCPContext() !== null;
}

/**
 * Meta-tool: run several tools of the CURRENT page in one call, in order,
 * fail-fast. Stops at the first failing tool and reports which calls ran,
 * which failed, and which were skipped. Cannot call itself; unknown names
 * and malformed input throw (programmer error, not tool failure).
 */
export function createMultiCallTool(
  getExecutors: () => ReadonlyMap<string, WebMCPTool['execute']>,
): WebMCPTool {
  return {
    name: 'call_multi_function',
    description:
      'Call several tools of this page in one step, in order. Continues while each call succeeds; stops at the first failure and skips the rest. Returns completed results, the failure, and skipped tool names. Example: {"calls": [{"tool": "get_join_input", "args": {}}]}.',
    inputSchema: objectSchema({
      calls: {
        type: 'array',
        description: 'Tool calls to run in order.',
        items: {
          type: 'object',
          properties: {
            tool: { type: 'string', description: 'Tool name on this page.' },
            args: { type: 'object', description: 'Arguments for the tool.' },
          },
          required: ['tool'],
          additionalProperties: false,
        },
        minItems: 1,
        maxItems: 20,
      },
    }, ['calls']),
    annotations: { readOnlyHint: false },
    execute: async (args: unknown) => {
      const calls = parseMultiCalls(args);
      const completed: { tool: string; result: unknown }[] = [];
      for (const call of calls) {
        if (call.tool === 'call_multi_function') {
          throw new Error('call_multi_function cannot call itself.');
        }
        const fn = getExecutors().get(call.tool);
        if (!fn) throw new Error(`Unknown tool "${call.tool}" on this page.`);
        try {
          completed.push({ tool: call.tool, result: await fn(call.args, {}) });
        } catch (error) {
          return {
            completed,
            failed: { tool: call.tool, error: error instanceof Error ? error.message : String(error) },
            skipped: calls.slice(completed.length + 1).map((item) => item.tool),
          };
        }
      }
      return { completed, failed: null, skipped: [] as string[] };
    },
  };
}

function parseMultiCalls(args: unknown): { tool: string; args: Record<string, unknown> }[] {
  if (typeof args !== 'object' || args === null || !('calls' in args)) {
    throw new Error(`Provide calls as a non-empty array of {tool, args}. Received: ${summarizeArgs(args)}.`);
  }
  const { calls } = args as { calls?: unknown };
  if (!Array.isArray(calls) || calls.length === 0) {
    throw new Error(`Provide calls as a non-empty array of {tool, args}. Received: ${summarizeArgs(args)}.`);
  }
  if (calls.length > 20) throw new Error('Maximum 20 calls per multi call.');
  return calls.map((item) => {
    if (typeof item !== 'object' || item === null || !('tool' in item)) {
      throw new Error(`Each call needs a tool name. Received: ${summarizeArgs(item)}.`);
    }
    const { tool, args: callArgs } = item as { tool?: unknown; args?: unknown };
    if (typeof tool !== 'string' || !tool) {
      throw new Error(`Each call needs a tool name. Received: ${summarizeArgs(item)}.`);
    }
    if (callArgs !== undefined && (typeof callArgs !== 'object' || callArgs === null || Array.isArray(callArgs))) {
      throw new Error(`Args for "${tool}" must be an object. Received: ${summarizeArgs(callArgs)}.`);
    }
    return { tool, args: (callArgs ?? {}) as Record<string, unknown> };
  });
}
/**
 * Register tools; returns how many were accepted. Never throws — a missing
 * or rejecting WebMCP implementation must not break normal UI interaction.
 * Pass an AbortSignal to unregister everything on unmount (Chrome pattern).
 */
export async function registerWebMCPTools(
  tools: WebMCPTool[],
  signal?: AbortSignal,
): Promise<number> {
  const context = getWebMCPContext();
  if (!context) return 0;
  let registered = 0;
  for (const tool of tools) {
    if (signal?.aborted) break;
    if (!isValidWebMCPToolName(tool.name) || !tool.description) continue;
    // Log failures to the console before rethrowing: some harnesses swallow
    // the rejection message, and the console keeps the real reason readable.
    const wrapped: WebMCPTool = {
      ...tool,
      execute: async (args, options) => {
        try {
          return await tool.execute(args, options);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const echoed = message.includes('Received:') ? message : `${message}. Received: ${summarizeArgs(args)}.`;
          console.warn(`[WebMCP] ${tool.name} failed: ${echoed}`);
          throw error;
        }
      },
    };
    try {
      if (signal) await context.registerTool(wrapped, { signal });
      else await context.registerTool(wrapped);
      registered += 1;
    } catch {
      // Ignore per-tool failures (duplicate name, bad schema, permissions).
    }
  }
  return registered;
}
