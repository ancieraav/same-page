import type { ReactNode } from 'react';
import { PAIR_MODE } from '@/lib/pairMode';

interface ResponseCardData {
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

const RESPONSES: ResponseCardData[] = [
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
        Our single highest-leverage priority must be{' '}
        <strong>locking the core checkout retention loop</strong> before scaling ad spend.
      </p>
    ),
    extended: (
      <p>
        We are explicitly deprioritizing ancillary redesign features, custom analytics dashboards, and non-essential UI churn until database latency stabilizes below 120ms.
      </p>
    ),
  },
  {
    id: 'alex',
    name: 'Alex Morgan',
    role: 'Design Partner',
    initials: 'AL',
    avatarColor: 'avatar-color-emerald',
    scoreMatch: '88% Match',
    scoreTone: 'tone-positive',
    preview: (
      <p>
        Priority is <strong>streamlining the checkout input form validation</strong> so users don&apos;t abandon when card details error out.
      </p>
    ),
    extended: (
      <p>
        Deprioritizing marketing landing page revamps and micro-interactions for now so the checkout funnel has zero visual distraction.
      </p>
    ),
  },
  // REVIVE: +3 multi-user responses (hidden in PAIR_MODE)
  ...(!PAIR_MODE ? [
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
        Primary focus is <strong>database replication pooling and Redis eviction policies</strong> to survive flash traffic spikes.
      </p>
    ),
    extended: (
      <p>
        We cannot afford server crashes on checkout while running multi-variant marketing promos.
      </p>
    ),
  },
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
        Priority is <strong>streamlining the checkout input form validation</strong> so users don&apos;t abandon when card details error out.
      </p>
    ),
    extended: (
      <p>
        Deprioritizing marketing landing page revamps and micro-interactions for now so the checkout funnel has zero visual distraction.
      </p>
    ),
  },
  {
    id: 'david',
    name: 'David Chen',
    role: 'Ops · Finance',
    initials: 'DC',
    avatarColor: 'avatar-color-cyan',
    scoreMatch: '73% Match',
    scoreTone: 'tone-moderate',
    preview: (
      <p>
        Commitment must be to <strong>automated fraud scoring before payment gateway settlement</strong> to stem chargeback velocity.
      </p>
    ),
    extended: (
      <p>
        Deprioritizing international multi-currency settlement till domestic gross merchandise value hits stable projections.
      </p>
    ),
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    role: 'Growth · Marketing',
    initials: 'SJ',
    avatarColor: 'avatar-color-rose',
    scoreMatch: '69% Match',
    scoreTone: 'tone-divided',
    preview: (
      <p>
        Need <strong>immediate referral share mechanics directly on payment completion</strong> to maintain user acquisition momentum.
      </p>
    ),
    extended: (
      <p>
        We can deprioritize internal merchant reporting portals in order to maximize customer-facing virality this month.
      </p>
    ),
  },
  ] as ResponseCardData[] : []),
];

function ResponseCardItem({
  data,
  index,
  isOpen,
  isVisible,
  onToggle,
}: {
  data: ResponseCardData;
  index: number;
  isOpen: boolean;
  isVisible: boolean;
  onToggle: (index: number) => void;
}) {
  return (
    <article
      className={`team-member-card${data.isSelf ? ' is-self' : ''}`}
      style={{ display: isVisible ? undefined : 'none' }}
    >
      <div className="team-card-profile-col">
        <div className={`room-avatar-circle ${data.avatarColor}`}>
          <span>{data.initials}</span>
        </div>
        <div className="team-member-info">
          <span className="team-member-name">{data.name}</span>
          {/* REVIVE: role line (hidden in PAIR_MODE) */}
          {!PAIR_MODE && <span className="team-member-role">{data.role}</span>}
        </div>
        <div className={`team-card-score-pill ${data.scoreTone}`}>
          <span>{data.scoreMatch}</span>
        </div>
      </div>
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
            onClick={() => { onToggle(index); }}
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

interface ComparisonResponsesListProps {
  visibleIds: string[];
  expanded: Set<number>;
  onToggle: (index: number) => void;
}

export function ComparisonResponsesList({
  visibleIds,
  expanded,
  onToggle,
}: ComparisonResponsesListProps) {
  return (
    <div className="team-list-stack" id="team-list-stack">
      {RESPONSES.map((item, index) => (
        <ResponseCardItem
          key={item.id}
          data={item}
          index={index}
          isOpen={expanded.has(index)}
          isVisible={visibleIds.includes(item.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
