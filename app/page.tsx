"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROOM_CODE_LENGTH = 7;

export default function Home() {
  const [joinCode, setJoinCode] = useState<string[]>(
    () => Array.from({ length: ROOM_CODE_LENGTH }, () => ""),
  );

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
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={"Room code character " + (index + 1)}
              />
            ))}
          </div>

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
            <Button className="room-button" type="button" aria-disabled="true">
              <img
                className="button-icon"
                src="/arrow-right-icon.svg"
                alt=""
                aria-hidden="true"
              />
              Join
            </Button>
          </div>
        </section>
      </main>
      </div>
    </div>
  );
}
