// WebMCP ambient declarations (spec is still a Community Group Draft).
// Primary: `document.modelContext` (Chrome 149+ origin trial / flag
// `chrome://flags/#enable-webmcp-testing`). Fallback: legacy
// `navigator.modelContext` proposal builds / `@mcp-b` polyfill convention.

interface WebMCPToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

interface WebMCPExecuteOptions {
  signal?: AbortSignal;
}

interface WebMCPRegisterOptions {
  signal?: AbortSignal;
  exposedTo?: string[];
}

interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (args: any, options: WebMCPExecuteOptions) => unknown;
  annotations?: WebMCPToolAnnotations;
  title?: string;
}

interface WebMCPRegisteredTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: WebMCPToolAnnotations;
  origin: string;
  title: string;
}

interface WebMCPModelContext extends EventTarget {
  registerTool(tool: WebMCPToolDefinition, options?: WebMCPRegisterOptions): Promise<void>;
  getTools(options?: { fromOrigins?: string[] }): Promise<WebMCPRegisteredTool[]>;
  executeTool(tool: WebMCPRegisteredTool, inputObject?: string, options?: WebMCPExecuteOptions): Promise<string | null>;
  ontoolchange: ((event: Event) => void) | null;
}

interface Document {
  readonly modelContext?: WebMCPModelContext;
}

interface Navigator {
  readonly modelContext?: WebMCPModelContext;
}

// Agent-triggered form submission (declarative API).
interface SubmitEvent extends Event {
  readonly agentInvoked?: boolean;
  respondWith?(value: Promise<unknown>): void;
}

interface WindowEventMap {
  toolactivated: Event & { toolName?: string };
  toolcancel: Event & { toolName?: string };
}

// NOTE: React attribute extensions (toolname / tooldescription /
// toolparamdescription) are applied at call sites via spread casts so this
// file stays free of `declare module 'react'` augmentation.
