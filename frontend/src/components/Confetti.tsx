import { useMemo } from 'react';

const COLORS = ['#fbbf24', '#f59e0b', '#facc15', '#a855f7', '#22d3ee', '#34d399', '#f472b6', '#ffffff'];

/**
 * Lightweight dependency-free confetti burst. Renders a fixed full-screen layer
 * of falling pieces; mount it when you want to celebrate, unmount to stop.
 */
export default function Confetti({ pieces = 140 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.6 + Math.random() * 2.6,
        color: COLORS[i % COLORS.length],
        width: 6 + Math.random() * 6,
        height: 9 + Math.random() * 8,
        drift: (Math.random() * 2 - 1) * 60,
      })),
    [pieces],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: '-6%',
            left: `${b.left}%`,
            width: b.width,
            height: b.height,
            background: b.color,
            borderRadius: 2,
            // @ts-expect-error custom property consumed by the keyframes below
            '--drift': `${b.drift}px`,
            animation: `confetti-fall ${b.duration}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate3d(var(--drift, 0px), 106vh, 0) rotate(720deg); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
