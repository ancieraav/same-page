import assert from "node:assert/strict";
import test, { after } from "node:test";

import { createServer } from "vite";

const root = new URL("..", import.meta.url).pathname;
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

test("defines a WebMCP tool with safe annotations", async () => {
  const { webMcpTool } = await vite.ssrLoadModule("/lib/webmcp.ts");
  const tool = webMcpTool({
    name: "start_room",
    title: "Start room",
    description: "Start the waiting room.",
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    inputSchema: { type: "object", required: ["code"] },
    execute: async () => ({ ok: true }),
  });

  assert.equal(tool.name, "start_room");
  assert.equal(tool.annotations.readOnlyHint, false);
  assert.equal(await tool.execute({}, { signal: new AbortController().signal }).then((result) => result.ok), true);
});

test("rejects a normal start request before checking credentials", async () => {
  const route = await vite.ssrLoadModule("/app/api/rooms/[code]/start/route.ts");
  const response = await route.POST(
    new Request("http://localhost/api/rooms/ABC1234/start", { method: "POST" }),
    { params: Promise.resolve({ code: "ABC1234" }) },
  );
  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, "AGENT_START_REQUIRED");
});
