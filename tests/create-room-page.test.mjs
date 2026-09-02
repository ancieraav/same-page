import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("renders the initial Create room prototype", async () => {
  const { CreateRoomForm } = await vite.ssrLoadModule(
    "/app/create-room/create-room-form.tsx",
  );
  const html = renderToStaticMarkup(React.createElement(CreateRoomForm));

  assert.match(html, /samepage-logo\.svg/);
  assert.ok(html.includes(">Same Page</span>"));
  assert.match(html, /User profile/);
  assert.match(html, /href="\/"/);
  assert.ok(html.includes(">Create room</h1>"));
  assert.ok(html.includes(">Add attachment</h2>"));
  assert.match(html, /Upload attachment/);
  assert.match(html, /Choose attachment/);
  assert.match(html, /Any other information\?/);
  assert.match(html, />Room name<\/label>/);
  assert.match(html, />Topic<\/label>/);
  assert.match(html, /Number of participants/);
  assert.match(html, /Use memes\?/);
  assert.match(html, /Use roles\?/);
  assert.match(
    html,
    /Allow all participants to view each other(?:&#x27;|&apos;|')s responses\./,
  );
  assert.match(html, />Cancel<\/a>/);
  assert.match(html, />Create<\/button>/);
  assert.match(html, /<form[^>]*class="create-room-form"/);

  assert.doesNotMatch(html, /How many participants\?/);
  assert.doesNotMatch(html, /Which roles do you want to use\?/);
  assert.doesNotMatch(html, /Keep participant names anonymous\?/);
});

test("defines all conditional Create room controls", async () => {
  const source = await readFile(
    new URL("../app/create-room/create-room-form.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /participantMode === "fixed"/);
  assert.match(source, /How many participants\?/);
  assert.match(source, /useRoles === "yes"/);
  assert.match(source, /Which roles do you want to use\?/);
  assert.match(source, /Source of truth/);
  assert.match(source, /New role…/);
  assert.match(source, /Edit selected role/);
  assert.match(source, /Separate the link and code\?/);
  assert.match(source, /shareResponses === "yes"/);
  assert.match(source, /Keep participant names anonymous\?/);
  assert.match(source, /clearAttachment/);
  assert.match(source, /removeRole/);
});
