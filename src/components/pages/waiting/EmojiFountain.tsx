export interface EmojiParticle {
  id: string;
  emoji: string;
  left: number;
  top: number;
  sway: string;
  fontSize: string;
  delay: string;
  duration: string;
}

export function EmojiFountain({ particles }: { particles: EmojiParticle[] }) {
  if (particles.length === 0) return null;
  return (
    <div className="emoji-fountain-layer" aria-hidden="true">
      {particles.map((particle) => (
        <span
          className="floating-emoji-item"
          key={particle.id}
          style={{
            left: `${String(particle.left)}px`,
            top: `${String(particle.top)}px`,
            fontSize: particle.fontSize,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            ['--sway' as string]: particle.sway,
          }}
        >
          {particle.emoji}
        </span>
      ))}
    </div>
  );
}
