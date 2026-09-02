"use client";

import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="brand-lockup" aria-label="SamePage">
            <span className="brand-logo-frame">
              <img
                className="brand-logo"
                src="/samepage-logo.svg"
                alt=""
                aria-hidden="true"
              />
            </span>
            <span className="brand-name">SamePage</span>
          </div>

          <nav className="main-nav" aria-label="Primary navigation">
            <button className="nav-link" type="button" aria-disabled="true">
              Drafts
            </button>
            <button className="nav-link" type="button" aria-disabled="true">
              History
            </button>
          </nav>

          <div className="profile-cluster">
            <Avatar className="profile-avatar" aria-label="Alex Morgan profile">
              <AvatarFallback>AM</AvatarFallback>
              <AvatarBadge className="profile-status" aria-hidden="true" />
            </Avatar>
          </div>
        </div>
      </header>

      <main className="site-main">
        <section className="join-card" aria-labelledby="join-title">
          <h1 id="join-title">Join your team</h1>
          <p className="join-description">
            Enter the room code shared with you to continue.
          </p>

          <div className="join-form">
            <label className="join-label" htmlFor="join-code">
              Room code
            </label>
            <div className="join-input-row">
              <Input
                id="join-code"
                className="join-input"
                value={joinCode}
                onChange={(event) =>
                  setJoinCode(event.target.value.toUpperCase())
                }
                placeholder="Paste room code"
                autoComplete="off"
                spellCheck={false}
                aria-describedby="join-code-hint"
              />
              <Button
                className="join-button"
                type="button"
                aria-disabled="true"
              >
                Join room
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
            <p className="join-code-hint" id="join-code-hint">
              Use the code shared by your team.
            </p>
          </div>

          <div className="action-divider" aria-hidden="true">
            <span>or</span>
          </div>

          <Button
            className="create-button"
            type="button"
            variant="outline"
            aria-disabled="true"
          >
            <Plus aria-hidden="true" />
            Create a room
          </Button>
        </section>
      </main>
    </div>
  );
}
