import assert from "node:assert/strict";
import test, { after } from "node:test";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const vite = await createServer({
  appType: "custom",
  configFile: false,
  root: new URL("..", import.meta.url).pathname,
  resolve: {
    alias: {
      "@": new URL("..", import.meta.url).pathname,
    },
  },
  server: {
    middlewareMode: true,
  },
});

after(async () => {
  await vite.close();
});

test("renders the SamePage join room prototype", async () => {
  const { default: Home } = await vite.ssrLoadModule("/app/page.tsx");
  const html = renderToStaticMarkup(React.createElement(Home));

  assert.match(html, /samepage-logo\.svg/);
  assert.match(html, /samepage-decorations\.svg/);
  assert.match(html, /add-icon\.svg/);
  assert.match(html, /arrow-right-icon\.svg/);
  assert.ok(html.includes(">Same Page</span>"));
  assert.match(html, /User profile/);
  assert.ok(html.includes(">Join or create room!</h1>"));
  assert.match(html, /role="group" aria-label="Room code"/);
  assert.equal((html.match(/id="room-code-\d"/g) ?? []).length, 7);
  assert.match(html, /id="room-code-1"/);
  assert.match(html, /id="room-code-7"/);
  assert.match(html, />Create/);
  assert.match(html, /href="\/create-room"/);
  assert.match(html, />Join/);
  assert.match(html, /Your name/);
  assert.doesNotMatch(html, /aria-disabled="true"/);
});
