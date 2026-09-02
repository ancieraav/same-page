import assert from "node:assert/strict";
import test, { after } from "node:test";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
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

const pages = [
  ["/app/waiting-room/page.tsx", "Waiting room", "/question"],
  ["/app/question/page.tsx", "Answer the question", "/question-two"],
  ["/app/question-two/page.tsx", "Compare responses", "/question-two-options"],
  ["/app/question-two-options/page.tsx", "Choose an answer", "/meme"],
  ["/app/meme/page.tsx", "Meme break", "/add-question"],
  ["/app/add-question/page.tsx", "Add a question", "/summary"],
  ["/app/summary/page.tsx", "Room summary", "/see-participant"],
  ["/app/see-participant/page.tsx", "See other participants", "/"],
];

test("renders every active Figma room-flow page", async () => {
  for (const [modulePath, heading, nextHref] of pages) {
    const page = await vite.ssrLoadModule(modulePath);
    const html = renderToStaticMarkup(React.createElement(page.default));

    assert.match(html, /samepage-logo\.svg/);
    assert.match(html, new RegExp(`>${heading}<`));
    assert.match(html, new RegExp(`href="${nextHref.replace("/", "\\/")}"`));
  }
});
