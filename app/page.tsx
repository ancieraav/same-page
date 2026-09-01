"use client";

import { useState } from "react";
import { ArrowRight, Bell, Check, ChevronDown, Users } from "lucide-react";
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
      showNotice("Enter a join code to preview the next step.");
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
            <button
              className="header-icon-button"
              type="button"
              onClick={() => showNotice("Notifications are a visual placeholder.")}
              aria-label="Open notifications"
            >
              <Bell size={18} />
              <span className="notification-dot" aria-hidden="true" />
            </button>

            <div className="profile-menu">
              <button
                className="profile-trigger"
                type="button"
                onClick={() => setProfileOpen((isOpen) => !isOpen)}
                aria-expanded={profileOpen}
              >
                <span className="profile-photo small" aria-hidden="true">
                  <span>AV</span>
                  <i />
                </span>
                <span className="profile-trigger-copy">
                  <strong>Alex Morgan</strong>
                  <small>Member</small>
                </span>
                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div className="profile-popover">
                  <span className="popover-label">Signed in as</span>
                  <strong>alex@example.com</strong>
                  <button type="button" onClick={() => showNotice("Profile settings are next in the prototype.")}>
                    Profile settings <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="dashboard-main">
        <div className="dashboard-topline">
          <div>
            <span className="dashboard-eyebrow">Workspace / Dashboard</span>
            <h1>Welcome back.</h1>
            <p>Your workspace is waiting for an invite.</p>
          </div>
        </div>

        <div className="dashboard-feature-grid">
          <article className="join-panel">
            <div className="panel-topline light">
              <span className="panel-label">Join a page</span>
              <span className="live-status"><i /> Not joined</span>
            </div>

            <div className="join-panel-copy">
              <span className="panel-kicker">Join a shared page</span>
              <h2>Enter your join code.</h2>
              <p>Paste the code from your host to continue.</p>
            </div>

            <div className="join-code-block">
              <label htmlFor="join-code">Join code</label>
              <div className="join-input-row">
                <Input
                  id="join-code"
                  className="join-input"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  placeholder="Enter code"
                  autoComplete="off"
                  aria-describedby="join-code-helper"
                />
                <Button className="join-button" type="button" onClick={previewJoin}>
                  Join page <ArrowRight size={16} />
                </Button>
              </div>
              <span className="join-helper" id="join-code-helper">Example code: 8Q7 LM2</span>
            </div>

            <div className="join-panel-footer">
              <span><i /> Waiting for a code</span>
              <span>No participants yet</span>
            </div>
          </article>
        </div>

        <section className="empty-panel">
          <div className="empty-icon"><Users size={21} /></div>
          <div className="empty-copy">
            <span className="panel-label">No active page</span>
            <h2>Your pages will show up here after you join.</h2>
            <p>For now, this is your clean waiting state.</p>
          </div>
          <button className="text-action" type="button" onClick={() => showNotice("The join flow is the only active step in this prototype.")}>
            How it works <ArrowRight size={15} />
          </button>
        </section>
      </section>

      <footer className="dashboard-footer">
        <span><i /> Prototype dashboard</span>
        <span>Simple now. Ready to grow later.</span>
      </footer>
    </main>
  );
}
