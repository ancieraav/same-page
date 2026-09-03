import type { ReactNode } from 'react';

interface ParticipantCardData {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
  scoreMatch: string;
  scoreTone: string;
  isSelf?: boolean;
  preview: ReactNode;
  extended: ReactNode;
}

const PARTICIPANTS: ParticipantCardData[] = [
  {
    id: 'elena',
    name: 'Elena Rostova',
    role: 'Design Lead',
    initials: 'ER',
    avatarColor: 'avatar-color-emerald',
    scoreMatch: '88% Match',
    scoreTone: 'tone-positive',
    preview: (
      <p>
        Priority is <strong>eliminating micro-friction in checkout typography</strong>, input masking, and form error validation states.
      </p>
    ),
    extended: (
      <p>
        Deprioritizing marketing landing page revamps and micro-interactions for now so the checkout funnel has zero visual distraction.
      </p>
    ),
  },
  {
    id: 'you',
    name: 'Anugrah (You)',
    role: 'Lead Product Strategist',
    initials: 'A',
    avatarColor: 'avatar-color-indigo',
    scoreMatch: '84% Match',
    scoreTone: 'tone-indigo',
    isSelf: true,
    preview: (
      <p>
        Our single highest-leverage priority must be <strong>locking the core checkout retention loop</strong> before scaling ad spend.
      </p>
    ),
    extended: (
      <p>
        Explicitly deprioritizing ancillary redesign features, custom analytics dashboards, and non-essential UI churn until database latency stabilizes below 120ms.
      </p>
    ),
  },
  {
    id: 'raka',
    name: 'Raka Pratama',
    role: 'Engineering Lead',
    initials: 'RP',
    avatarColor: 'avatar-color-amber',
    scoreMatch: '78% Match',
    scoreTone: 'tone-positive',
    preview: (
      <p>
        I agree that <strong>checkout reliability and database indexing</strong> take 100% precedence for our upcoming production release.
      </p>
    ),
    extended: (
      <p>
        Completely deprioritizing new third-party marketing integrations and localized payment gateways until infrastructure stress tests pass under 5,000 req/sec.
      </p>
    ),
  },
  {
    id: 'david',
    name: 'David Chen',
    role: 'Ops • Finance',
    initials: 'DC',
    avatarColor: 'avatar-color-rose',
    scoreMatch: '73% Match',
    scoreTone: 'tone-neutral',
    preview: (
      <p>
        Protecting <strong>unit margin and refund reconciliation</strong> is top operational priority for financial health.
      </p>
    ),
    extended: (
      <p>
        Agreeing to deprioritize custom enterprise invoicing and multi-currency billing until checkout payment webhooks achieve 99.99% automated reconciliation.
      </p>
    ),
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    role: 'Growth • Marketing',
    initials: 'SJ',
    avatarColor: 'avatar-color-cyan',
    scoreMatch: '69% Match',
    scoreTone: 'tone-neutral',
    preview: (
      <p>
        We need <strong>frictionless conversion from paid campaigns</strong> to ensure our acquisition budget is not leaking users.
      </p>
    ),
    extended: (
      <p>
        Pausing viral referral invite popups to ensure core checkout payment conversion rates stay robust.
      </p>
    ),
  },
];

function ParticipantCardItem({
  data,
  index,
  isOpen,
  isVisible,
  onToggle,
  onOpen,
}: {
  data: ParticipantCardData;
  index: number;
  isOpen: boolean;
  isVisible: boolean;
  onToggle: (index: number) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <article
      className={`team-member-card${data.isSelf ? ' is-self' : ''}`}
      data-participant-id={data.id}
      style={{ display: isVisible ? undefined : 'none' }}
    >
      <button
        type="button"
        className="team-card-profile-col"
        aria-label={data.isSelf ? 'View your analytics' : `View ${data.name} analytics`}
        onClick={() => { onOpen(data.id); }}
      >
        <div className={`room-avatar-circle ${data.avatarColor}`}>
          <span>{data.initials}</span>
        </div>
        <div className="team-member-info">
          <span className="team-member-name">{data.name}</span>
          <span className="team-member-role">{data.role}</span>
        </div>
        <div className={`team-card-score-pill ${data.scoreTone}`}>
          <span>{data.scoreMatch}</span>
        </div>
      </button>
      <div className="team-card-statement-col">
        <div className="statement-expandable-wrap">
          <div className="statement-preview-text">
            {data.preview}
          </div>
          <div className={`statement-extended-text${isOpen ? ' is-open' : ''}`}>
            {data.extended}
          </div>
          <button
            type="button"
            className={`btn-read-more-statement${isOpen ? ' is-expanded' : ''}`}
            aria-expanded={isOpen}
            title="Toggle full response"
            onClick={(event) => {
              event.stopPropagation();
              onToggle(index);
            }}
          >
            <span>{isOpen ? 'Show less' : 'Read more'}</span>
            <svg className="chevron-mini" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

interface ParticipantsCardListProps {
  visibleIds: string[];
  expanded: Set<number>;
  onToggle: (index: number) => void;
  onOpen: (id: string) => void;
}

export function ParticipantsCardList({
  visibleIds,
  expanded,
  onToggle,
  onOpen,
}: ParticipantsCardListProps) {
  return (
    <div className="team-list-stack" id="team-list-stack">
      {PARTICIPANTS.map((participant, index) => (
        <ParticipantCardItem
          key={participant.id}
          data={participant}
          index={index}
          isOpen={expanded.has(index)}
          isVisible={visibleIds.includes(participant.id)}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
