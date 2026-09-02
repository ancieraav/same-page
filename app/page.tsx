"use client";

import { useRef, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROOM_CODE_LENGTH = 7;

export default function Home() {
  const [joinCode, setJoinCode] = useState<string[]>(
    () => Array.from({ length: ROOM_CODE_LENGTH }, () => ""),
  );
  const codeInputs = useRef<Array<HTMLInputElement | null>>([]);

  function updateCode(index: number, value: string) {
    const nextCharacter = value
      .replace(/[^a-z0-9]/gi, "")
      .slice(-1)
      .toUpperCase();
    const nextCode = [...joinCode];
    nextCode[index] = nextCharacter;
    setJoinCode(nextCode);

    if (nextCharacter && index < ROOM_CODE_LENGTH - 1) {
      codeInputs.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !joinCode[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="site-shell">
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
                ref={(element) => {
                  codeInputs.current[index] = element;
                }}
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
              <Plus aria-hidden="true" />
              Create
            </Button>
            <Button className="room-button" type="button" aria-disabled="true">
              <ArrowRight aria-hidden="true" />
              Join
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
