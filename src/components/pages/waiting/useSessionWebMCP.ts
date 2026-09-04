'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { registerWebMCPTools, type WebMCPTool } from '@/lib/webmcp';
import { sessionToolsCore } from './sessionToolsCore';
import { sessionToolsRounds } from './sessionToolsRounds';
import { sessionToolsFinal } from './sessionToolsFinal';
import { sessionToolsWaiting } from './waitingTools';
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

/** Waiting-usable session tools; everything else is session-only. */
const WAITING_REAL_TOOLS = new Set([
  'start_session',
  'view_goals_workflow',
  'view_current_workflow',
  'list_context',
  'view_context',
]);

/** Operator-only even inside the waiting room. */
const OPERATOR_ONLY_TOOLS = new Set(['start_session', 'kick_participant']);

/** Session-only tool called while waiting: fail with a pointer, don't call the API. */
function withWaitingGate(tool: WebMCPTool, getStatus?: () => string): WebMCPTool {
  return {
    ...tool,
    description: `${tool.description} (Session-only: not usable while the room is still waiting.)`,
    execute: async (args, options) => {
      const status = getStatus?.() ?? 'waiting';
      if (status !== 'waiting') return tool.execute(args, options);
      throw new Error(
        `"${tool.name}" is not available yet — the session hasn't started (room is still waiting). ` +
        'Call start_session after both players are ready, then use this tool. ' +
        'See view_current_workflow for the current goal.',
      );
    },
  };
}

/**
 * Waiting phase: leave/room-code/participants (+ kick/start for the
 * operator); session tools exist but session-only ones hint "not yet".
 * Session phase: full session surface, no waiting tools (leave/kick gone).
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

    let tools: WebMCPTool[];
    if (phase === 'session') {
      tools = [
        ...sessionToolsCore(getBindings),
        ...sessionToolsRounds(getBindings),
        ...sessionToolsFinal(getBindings),
      ];
    } else {
      const room = sessionToolsWaiting(getBindings).filter(
        (tool) => isOperator || !OPERATOR_ONLY_TOOLS.has(tool.name),
      );
      const session = [
        ...sessionToolsCore(getBindings),
        ...sessionToolsRounds(getBindings),
        ...sessionToolsFinal(getBindings),
      ].map((tool) => (WAITING_REAL_TOOLS.has(tool.name) ? tool : withWaitingGate(tool, getStatus)));
      const start = session.filter((tool) => tool.name === 'start_session');
      const rest = session.filter((tool) => tool.name !== 'start_session');
      tools = [...room, ...(isOperator ? start : []), ...rest];
    }
    // Operator-only tools are filtered at registration; participants calling
    // them is impossible, and start/kick never mount in the session phase.
    void registerWebMCPTools(tools, controller.signal);
    return () => { controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, watchKey]);
}
