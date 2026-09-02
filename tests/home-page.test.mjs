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
  assert.ok(html.includes(">SamePage</span>"));
  assert.ok(html.includes(">Drafts</button>"));
  assert.ok(html.includes(">History</button>"));
  assert.match(html, /Alex Morgan profile/);
  assert.ok(html.includes(">Join your team</h1>"));
  assert.match(html, /Enter the room code shared with you to continue./);
  assert.match(html, /id="join-code"/);
  assert.match(html, /placeholder="Paste room code"/);
  assert.match(html, />Join room/);
  assert.match(html, />Create a room/);
  assert.match(html, /aria-disabled="true"/);
});
