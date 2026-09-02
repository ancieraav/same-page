"use client";

/// <reference types="webmcp-types" />

import { useEffect, useMemo, useRef } from "react";

type LegacyNavigator = Navigator & {
  modelContext?: WebMCP.ModelContext;
};

export function getModelContext(): WebMCP.ModelContext | null {
  if (typeof document === "undefined") return null;
  return document.modelContext ?? (navigator as LegacyNavigator).modelContext ?? null;
}

export type WebMcpTool = WebMCP.ModelContextTool & {
  key?: string;
};

export function useWebMcpTools(tools: WebMcpTool[]): { available: boolean } {
  const toolsRef = useRef(tools);

  const toolNames = useMemo(
    () => tools.map((tool) => `${tool.name}:${tool.key ?? ""}`).join("|"),
    [tools],
  );

  useEffect(() => {
    toolsRef.current = tools;
  }, [tools]);

  useEffect(() => {
    const modelContext = getModelContext();
    if (!modelContext || tools.length === 0) return;

    const controllers = tools.map(() => new AbortController());
    const stableTools = tools.map((tool) => ({
      ...tool,
      execute: (input: Record<string, unknown>, options: WebMCP.ToolExecuteCallbackOptions) => {
        const current = toolsRef.current.find((candidate) => candidate.name === tool.name);
        if (!current) {
          return { ok: false, code: "TOOL_UNAVAILABLE", message: "This tool is no longer available." };
        }
        return current.execute(input, options);
      },
    }));

    void Promise.all(
      stableTools.map((tool, index) =>
        modelContext.registerTool(tool, { signal: controllers[index].signal }).catch(() => undefined),
      ),
    );

    return () => {
      controllers.forEach((controller) => controller.abort());
    };
    // The ref keeps callbacks current without re-registering tools for every state update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolNames]);

  return { available: Boolean(getModelContext()) };
}

export function webMcpTool<T extends Record<string, unknown>>({
  name,
  title,
  description,
  inputSchema,
  annotations,
  execute,
  key,
}: {
  name: string;
  title: string;
  description: string;
  inputSchema?: object;
  annotations?: WebMCP.ToolAnnotations;
  execute: (input: T, options: WebMCP.ToolExecuteCallbackOptions) => unknown;
  key?: string;
}): WebMcpTool {
  return {
    name,
    title,
    description,
    inputSchema,
    annotations,
    execute: execute as WebMCP.ToolExecuteCallback,
    key,
  };
}
