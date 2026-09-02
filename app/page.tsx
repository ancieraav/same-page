"use client";

import { useEffect, useMemo, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildRoomHref,
  getInviteTokenFromLocation,
  getRoomCodeFromLocation,
  joinRoom,
  isRoomCodeComplete,
} from "@/lib/samepage/client";
import { getErrorMessage } from "@/lib/samepage/errors";
import { ROOM_CODE_LENGTH } from "@/lib/samepage/validation";
import { useWebMcpTools, webMcpTool } from "@/lib/webmcp";


export default function Home() {
  const [joinCode, setJoinCode] = useState<string[]>(
    () => Array.from({ length: ROOM_CODE_LENGTH }, () => ""),
  );
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const code = joinCode.join("");
  const inviteToken = getInviteTokenFromLocation();

  useEffect(() => {
    const initialCode = getRoomCodeFromLocation();
    if (!initialCode) return;
    // The browser URL is client-only state; hydrate the blank form first so
    // server and client markup remain identical for shared invite links.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJoinCode((current) =>
      current.map((_, index) => initialCode[index] ?? ""),
    );
  }, []);

  function focusCodeInput(index: number) {
    document.getElementById("room-code-" + (index + 1))?.focus();
  }

  function updateCode(index: number, value: string) {
    const nextCharacter = value
      .replace(/[^a-z0-9]/gi, "")
      .slice(-1)
      .toUpperCase();
    const nextCode = [...joinCode];
    nextCode[index] = nextCharacter;
    setJoinCode(nextCode);

    if (nextCharacter && index < ROOM_CODE_LENGTH - 1) {
      focusCodeInput(index + 1);
    }
  }

  function handleCodeKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !joinCode[index] && index > 0) {
      focusCodeInput(index - 1);
    }
  }

  function handleCodePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, ROOM_CODE_LENGTH)
      .toUpperCase();
    if (!pastedCode) return;
    setJoinCode((current) =>
      current.map((_, index) => pastedCode[index] ?? ""),
    );
  }

  async function handleJoin(
    requestedCode = code,
    requestedName = displayName,
    requestedInvite = inviteToken,
  ) {
    if (!isRoomCodeComplete(requestedCode)) {
      setError("Enter the 7-character room code.");
      return;
    }
    if (!requestedName.trim()) {
      setError("Enter your name to join the room.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await joinRoom({
        code: requestedCode,
        displayName: requestedName,
        joinToken: requestedInvite,
      });
      window.location.assign(buildRoomHref("/waiting-room", requestedCode));
    } catch (cause) {
      setError(getErrorMessage(cause));
      setBusy(false);
    }
  }

  const agentTools = useMemo(
    () => [
      webMcpTool({
        name: "join_room",
        title: "Join room",
        description: "Join a SamePage room with a 7-character code and participant name.",
        inputSchema: {
          type: "object",
          properties: {
            code: { type: "string", description: "The 7-character room code." },
            name: { type: "string", description: "The participant display name." },
            invite: { type: "string", description: "The separate invite token, when required." },
          },
          required: ["code", "name"],
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          const requestedCode = String(input.code ?? "");
          const requestedName = String(input.name ?? "");
          const requestedInvite = input.invite ? String(input.invite) : inviteToken;
          await joinRoom({
            code: requestedCode,
            displayName: requestedName,
            joinToken: requestedInvite,
          });
          const nextRoute = buildRoomHref("/waiting-room", requestedCode);
          window.location.assign(nextRoute);
          return {
            ok: true,
            roomCode: requestedCode.toUpperCase(),
            nextRoute,
          };
        },
      }),
    ],
    [inviteToken],
  );
  const { available: webmcpAvailable } = useWebMcpTools(agentTools);

  return (
    <div className="site-shell">
      <div className="design-stage">
      <img
        className="decorative-group"
        src="/samepage-decorations.svg"
        alt=""
        aria-hidden="true"
      />

        <SiteHeader />

        <main className="site-main">
          <section className="join-area" aria-labelledby="join-title">
          <h1 id="join-title">Join or create room!</h1>

          <div className="code-inputs" role="group" aria-label="Room code">
            {joinCode.map((character, index) => (
              <Input
                key={index}
                id={"room-code-" + (index + 1)}
                className="code-input"
                type="text"
                inputMode="text"
                maxLength={1}
                value={character}
                onChange={(event) => updateCode(index, event.target.value)}
                onKeyDown={(event) => handleCodeKeyDown(index, event)}
                onPaste={index === 0 ? handleCodePaste : undefined}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                autoCapitalize="characters"
                aria-label={"Room code character " + (index + 1)}
              />
            ))}
          </div>

          <Input
            className="join-name-input"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Your name"
            aria-label="Your name"
            maxLength={60}
            autoComplete="name"
            disabled={busy}
          />

          <div className="room-actions">
            <Button className="room-button" asChild>
              <Link href="/create-room">
                <img
                  className="button-icon"
                  src="/add-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                Create
              </Link>
            </Button>
            <Button
              className="room-button"
              type="button"
              disabled={busy}
              onClick={() => void handleJoin()}
            >
              <img
                className="button-icon"
                src="/arrow-right-icon.svg"
                alt=""
                aria-hidden="true"
              />
              Join
            </Button>
          </div>
          {error ? <p className="join-error" role="alert">{error}</p> : null}
          <p className="join-agent-note" role="status">
            {webmcpAvailable
              ? "An agent can also join this room with the join_room tool."
              : "Participants can join with the room code; an agent can start the room later."}
          </p>
        </section>
      </main>
      </div>
    </div>
  );
}
