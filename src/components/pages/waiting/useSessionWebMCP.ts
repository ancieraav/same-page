'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { createMultiCallTool, registerWebMCPTools, type WebMCPTool } from '@/lib/webmcp';
import { sessionToolsCore } from './sessionToolsCore';
import { sessionToolsRounds } from './sessionToolsRounds';
import { sessionToolsFinal } from './sessionToolsFinal';
import { sessionToolsWaiting } from './waitingTools';
import { sessionToolsTimeline } from './sessionToolsTimeline';
import { sessionToolsAnswers } from './sessionToolsAnswers';
import type { SessionToolsBindings } from './sessionToolsShared';

export type { SessionToolsBindings };

export interface SessionWebMCPOptions extends SessionToolsBindings {
  /** Waiting page: room tools + session stubs. Session page: full session tools. */
  phase?: 'waiting' | 'session';
  /** Re-register when this changes (role resolve, status change). */
  watchKey?: string;
}

/** Ref sync that commits before paint, so back-to-back tool calls see fresh state. */
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Session tools remain visible in waiting, where this gate explains the next phase. */
function withWaitingGate(tool: WebMCPTool, getStatus?: () => string): WebMCPTool {
  return {
    ...tool,
    description: `${tool.description} (Session-only: not usable while the room is still waiting.)`,
    execute: (args, options) => {
      const status = getStatus?.() ?? 'waiting';
      if (status !== 'waiting') return tool.execute(args, options);
      throw new Error(
        `"${tool.name}" is gated until the session starts (room is still waiting). ` +
        'Call start_session after both players are ready, then use this tool. ' +
        'See view_current_workflow for the current goal.',
      );
    },
  };
}

/**
 * Session tools are registered from waiting through completion for their
 * matching role. Waiting-only chat and room controls mount only while waiting.
 */
export function useSessionWebMCP(options: SessionWebMCPOptions) {
  const bindingsRef = useRef<SessionToolsBindings>(options);
  useClientLayoutEffect(() => {
    bindingsRef.current = options;
  });

  const phase = options.phase ?? 'waiting';
  const watchKey = options.watchKey ?? phase;

  useEffect(() => {
    const controller = new AbortController();
    const getBindings = (): SessionToolsBindings => bindingsRef.current;
    const isOperator = getBindings().isOperator();
    const getStatus = (): string => getBindings().getStatus?.() ?? 'waiting';

    const roleTools = isOperator
      ? [...sessionToolsCore(getBindings), ...sessionToolsRounds(getBindings), ...sessionToolsFinal(getBindings)]
      : sessionToolsAnswers(getBindings);
    const stagedRoleTools = phase === 'waiting'
      ? roleTools.map((tool) => tool.name === 'start_session' ? tool : withWaitingGate(tool, getStatus))
      : roleTools;
    const waitingTools = phase === 'waiting'
      ? sessionToolsWaiting(getBindings).filter((tool) => isOperator || tool.name !== 'kick_participant')
      : [];
    const tools: WebMCPTool[] = [
      ...waitingTools,
      ...sessionToolsTimeline(getBindings),
      ...stagedRoleTools,
    ];
    const executors = new Map(tools.map((tool) => [tool.name, tool.execute]));
    tools.push(createMultiCallTool(() => executors));
    void registerWebMCPTools(tools, controller.signal);
    return () => { controller.abort(); };
  }, [phase, watchKey]);
}
