const teammates = [
  { name: 'You', initials: 'AR', color: 'avatar-color-indigo', done: false },
  { name: 'Elena', initials: 'ER', color: 'avatar-color-cyan', done: true },
  { name: 'Marcus', initials: 'MV', color: 'avatar-color-amber', done: true },
  { name: 'Siti', initials: 'SS', color: 'avatar-color-rose', done: false },
  { name: 'David', initials: 'DC', color: 'avatar-color-purple', done: false },
];

export function SessionAvatarStack() {
  return <div className="avatar-stack-row">{teammates.map((teammate, index) => <div className={`stacked-avatar-circle ${teammate.color}${teammate.done ? ' is-answered' : ''}`} style={{ zIndex: teammates.length - index }} title={`${teammate.name} (${teammate.done ? 'Submitted response' : 'Writing response...'})`} key={teammate.name}><span>{teammate.initials}</span>{teammate.done && <div className="stacked-avatar-check"><svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg></div>}</div>)}</div>;
}
