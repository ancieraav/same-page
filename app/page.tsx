"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Copy,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";

const JOIN_CODE = "8Q7 LM2";

const recentPages = [
  { title: "Weekend plans", detail: "4 people · updated 8 min ago", color: "lime" },
  { title: "Q3 launch alignment", detail: "7 people · updated yesterday", color: "lavender" },
  { title: "Studio offsite", detail: "12 people · updated Aug 28", color: "butter" },
];

const activity = [
  { initials: "JM", name: "Jamie joined", detail: "Weekend plans", color: "blue" },
  { initials: "RK", name: "Raka joined", detail: "Weekend plans", color: "coral" },
  { initials: "AV", name: "You created", detail: "Q3 launch alignment", color: "green" },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function copyJoinCode() {
    setCopied(true);
    showNotice("Join code copied for this demo.");
    window.setTimeout(() => setCopied(false), 1800);
  }

  function selectNavigation(label: string) {
    setActiveNav(label);
    showNotice(`${label} selected — more views can be added here.`);
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
            onClick={() => selectNavigation("Overview")}
            aria-label="Go to SamePage overview"
          >
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span>SamePage</span>
          </button>

          <nav className="dashboard-nav" aria-label="Primary navigation">
            {[
              { label: "Overview", icon: LayoutDashboard },
              { label: "Pages", icon: Users },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                className={activeNav === label ? "nav-button active" : "nav-button"}
                type="button"
                onClick={() => selectNavigation(label)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          <div className="dashboard-header-actions">
            <button className="header-code" type="button" onClick={copyJoinCode}>
              <span>Join code</span>
              <strong>{JOIN_CODE}</strong>
              <Copy size={15} />
            </button>
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

      <section className="dashboard-main" id="overview">
        <div className="dashboard-topline">
          <div>
            <span className="dashboard-eyebrow">Workspace / Overview</span>
            <h1>Good morning, Alex.</h1>
            <p>Everything you need to get your group on the same page.</p>
          </div>
          <button className="primary-action" type="button" onClick={() => showNotice("New page flow is ready for the next prototype step.")}>
            <Plus size={17} />
            New page
          </button>
        </div>

        <div className="dashboard-feature-grid">
          <article className="join-panel">
            <div className="panel-topline light">
              <span className="panel-label">Live page</span>
              <span className="live-status"><i /> Ready to join</span>
            </div>

            <div className="join-panel-copy">
              <span className="panel-kicker">Current page</span>
              <h2>Weekend plans</h2>
              <p>Share the code below with your group to bring everyone into the same conversation.</p>
            </div>

            <div className="join-code-block">
              <span>Join code</span>
              <strong>{JOIN_CODE}</strong>
              <button type="button" onClick={copyJoinCode}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy code"}
              </button>
            </div>

            <div className="join-panel-footer">
              <div className="participant-summary">
                <div className="mini-avatars" aria-hidden="true">
                  <span className="avatar-lavender">A</span>
                  <span className="avatar-butter">J</span>
                  <span className="avatar-coral">R</span>
                  <span className="avatar-lime">+1</span>
                </div>
                <span>4 people are ready</span>
              </div>
              <button className="light-action" type="button" onClick={() => showNotice("Current page preview selected.")}>
                Open page <ArrowRight size={16} />
              </button>
            </div>
          </article>

          <article className="profile-panel">
            <div className="panel-topline">
              <span className="panel-label">Profile</span>
              <button className="card-icon-button" type="button" onClick={() => showNotice("Profile actions are a visual placeholder.")} aria-label="More profile actions">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="profile-intro">
              <div className="profile-photo large" aria-label="Alex Morgan profile photo" role="img">
                <span>AV</span>
                <i />
              </div>
              <div>
                <h2>Alex Morgan</h2>
                <p>alex@example.com</p>
              </div>
            </div>

            <div className="profile-stats">
              <div><strong>12</strong><span>pages joined</span></div>
              <div><strong>04</strong><span>active today</span></div>
            </div>

            <button className="profile-link" type="button" onClick={() => { setProfileOpen(true); showNotice("Profile menu opened for the prototype."); }}>
              View profile <ArrowRight size={16} />
            </button>
          </article>
        </div>

        <div className="dashboard-section-grid">
          <section className="recent-panel" id="pages">
            <div className="section-heading">
              <div>
                <span className="panel-label">Your pages</span>
                <h2>Recent activity</h2>
              </div>
              <button className="text-action" type="button" onClick={() => selectNavigation("Pages")}>
                View all <ArrowRight size={15} />
              </button>
            </div>

            <div className="recent-list">
              {recentPages.map((page) => (
                <button className="recent-row" type="button" key={page.title} onClick={() => showNotice(`${page.title} selected for the prototype.`)}>
                  <span className={`page-icon ${page.color}`}><Users size={17} /></span>
                  <span className="recent-copy"><strong>{page.title}</strong><small>{page.detail}</small></span>
                  <ArrowRight className="row-arrow" size={17} />
                </button>
              ))}
            </div>
          </section>

          <aside className="activity-panel">
            <div className="section-heading compact">
              <div>
                <span className="panel-label">Live feed</span>
                <h2>Who is here?</h2>
              </div>
              <button className="card-icon-button" type="button" onClick={() => showNotice("Activity filters are a visual placeholder.")} aria-label="Filter activity">
                <Search size={17} />
              </button>
            </div>

            <div className="activity-list">
              {activity.map((item) => (
                <button className="activity-row" type="button" key={`${item.name}-${item.detail}`} onClick={() => showNotice(`${item.name} selected for the prototype.`)}>
                  <span className={`activity-avatar ${item.color}`}>{item.initials}</span>
                  <span><strong>{item.name}</strong><small>{item.detail}</small></span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <footer className="dashboard-footer">
        <span><i /> Prototype dashboard</span>
        <span>Simple now. Ready to grow later.</span>
      </footer>
    </main>
  );
}
