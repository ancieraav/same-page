// PAIR_MODE: 2 avatars. REVIVE: restore 5 below.
const teammates = [
  { name: 'You', initials: 'AR', color: 'avatar-color-indigo', done: false },
  { name: 'Alex', initials: 'AL', color: 'avatar-color-cyan', done: true },
];

export function SessionAvatarStack() {
  return <div className="avatar-stack-row">{teammates.map((teammate, index) => <div className={`stacked-avatar-circle ${teammate.color}${teammate.done ? ' is-answered' : ''}`} style={{ zIndex: teammates.length - index }} title={`${teammate.name} (${teammate.done ? 'Submitted response' : 'Writing response...'})`} key={teammate.name}><span>{teammate.initials}</span>{teammate.done && <div className="stacked-avatar-check"><svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg></div>}</div>)}</div>;
}
