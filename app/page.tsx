"use client";

import { useState, type KeyboardEvent } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
      <img
        className="gavel-illustration"
        src="/gavel-illustration.svg"
        alt=""
        aria-hidden="true"
      />
      <img
        className="cloud-illustration"
        src="/cloud-illustration.svg"
        alt=""
        aria-hidden="true"
      />

      <header className="site-header">
        <div className="site-header-inner">
          <div className="brand-lockup" aria-label="Same Page">
            <span className="brand-logo-frame">
              <img
                className="brand-logo"
                src="/samepage-logo.svg"
                alt=""
                aria-hidden="true"
              />
            </span>
            <span className="brand-name">Same Page</span>
          </div>

          <nav className="main-nav" aria-label="Primary navigation">
            <button className="nav-link" type="button" aria-disabled="true">
              Drafts
            </button>
            <button className="nav-link" type="button" aria-disabled="true">
              History
            </button>
            <Avatar className="profile-avatar" aria-label="Alex Morgan profile">
              <AvatarFallback aria-hidden="true" />
            </Avatar>
          </nav>
        </div>
      </header>

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
            <Button className="room-button" type="button" aria-disabled="true">
              <img
                className="button-icon"
                src="/add-icon.svg"
                alt=""
                aria-hidden="true"
              />
              Create
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
  );
}
