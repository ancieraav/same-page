import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type RoomFlowShellProps = {
  title: string;
  description: string;
  eyebrow?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
  children: ReactNode;
};

export function RoomFlowShell({
  title,
  description,
  eyebrow = "Same Page room",
  backHref = "/",
  backLabel = "Back",
  className = "",
  children,
}: RoomFlowShellProps) {
  return (
    <div className={`room-flow-shell ${className}`.trim()}>
      <SiteHeader />

      <main className="room-flow-main">
        <div className="room-flow-content">
          <div className="room-flow-heading">
            <Button
              className="flow-back-button"
              variant="ghost"
              size="icon"
              asChild
            >
              <Link href={backHref} aria-label={backLabel}>
                <ArrowLeftIcon aria-hidden="true" />
              </Link>
            </Button>
            <div className="room-flow-heading-copy">
              <span className="flow-eyebrow">{eyebrow}</span>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}

type FlowActionsProps = {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
};

export function FlowActions({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className = "",
}: FlowActionsProps) {
  return (
    <div className={`flow-actions ${className}`.trim()}>
      {secondaryHref && secondaryLabel ? (
        <Button className="flow-action flow-action-secondary" variant="outline" asChild>
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      ) : null}
      <Button className="flow-action flow-action-primary" asChild>
        <Link href={primaryHref}>
          {primaryLabel}
          <ArrowRightIcon aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

export function ParticipantAvatar({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className={`flow-avatar ${className}`.trim()}>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

export function FlowPill({ children }: { children: ReactNode }) {
  return <span className="flow-pill">{children}</span>;
}
