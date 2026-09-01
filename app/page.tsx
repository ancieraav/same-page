"use client";

import { useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const [notice, setNotice] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function previewJoin() {
    if (!joinCode.trim()) {
      showNotice("Enter a join code to continue.");
      return;
    }

    showNotice("Join flow is a visual placeholder — you are still not joined.");
  }

  return (
    <main className="dashboard-app">
      <div className="dashboard-grid" aria-hidden="true" />

      {notice && (
        <div className="prototype-toast" role="status">
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <button
            className="dashboard-brand"
            type="button"
            onClick={() => showNotice("You are already on the dashboard.")}
            aria-label="SamePage dashboard"
          >
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span>SamePage</span>
          </button>

          <div className="dashboard-header-actions">
            <span className="join-state-pill"><i /> Not joined</span>
            <div className="profile-menu">
              <button
                className="profile-trigger"
                type="button"
                onClick={() => setProfileOpen((isOpen) => !isOpen)}
                aria-expanded={profileOpen}
                aria-label="Open profile"
              >
                <span className="profile-photo small" aria-hidden="true">
                  <span>AV</span>
                  <i />
                </span>
                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div className="profile-popover">
                  <span className="popover-label">Profile</span>
                  <strong>Alex Morgan</strong>
                  <small>alex@example.com</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="prejoin-main">
        <section className="join-panel" aria-labelledby="join-code-title">
          <div className="join-panel-header">
            <h1 id="join-code-title">Join code</h1>
          </div>

          <div className="join-input-row">
            <label className="sr-only" htmlFor="join-code">Join code</label>
            <Input
              id="join-code"
              className="join-input"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder="Enter code"
              autoComplete="off"
            />
            <Button className="join-button" type="button" onClick={previewJoin}>
              Join <ArrowRight size={16} />
            </Button>
          </div>
        </section>
      </section>
    </main>
  );
}
