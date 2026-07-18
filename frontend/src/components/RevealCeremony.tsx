import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Crown, Trophy } from 'lucide-react';
import { leaderboardApi } from '../services/api';
import { REGION_DISPLAY_NAMES, type LeaderboardEntry } from '../types';
import { RESULTS_REVEAL_AT } from '../config/reveal';
import Confetti from './Confetti';

const SEEN_KEY = 'fifa_reveal_ceremony_v1';

const SPOT_STYLE: Record<number, { pedestal: string; ring: string; badge: string; label: string; glow: string }> = {
  1: { pedestal: 'h-28 bg-gradient-to-t from-amber-500 to-yellow-300', ring: 'ring-amber-400', badge: 'bg-amber-400 text-amber-950', label: 'text-amber-300', glow: 'shadow-amber-500/40' },
  2: { pedestal: 'h-20 bg-gradient-to-t from-slate-500 to-slate-300', ring: 'ring-slate-300', badge: 'bg-slate-200 text-slate-800', label: 'text-slate-200', glow: 'shadow-slate-400/30' },
  3: { pedestal: 'h-14 bg-gradient-to-t from-orange-800 to-orange-500', ring: 'ring-orange-500', badge: 'bg-orange-500 text-orange-950', label: 'text-orange-300', glow: 'shadow-orange-600/30' },
};

function Spot({ entry, place, visible }: { entry: LeaderboardEntry; place: number; visible: boolean }) {
  const s = SPOT_STYLE[place];
  const name = entry.user?.displayName || entry.user?.username || '—';
  const region = entry.user?.regionDisplayName
    || (entry.user?.region ? REGION_DISPLAY_NAMES[entry.user.region] : '');

  return (
    <div
      className={clsx(
        'flex w-1/3 max-w-[9rem] flex-col items-center transition-all duration-700',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
    >
      {place === 1
        ? <Crown className="mb-1 h-6 w-6 text-amber-400 drop-shadow" />
        : <div className="mb-1 h-6" />}

      <div className={clsx('relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 shadow-lg ring-2', s.ring, s.glow)}>
        <span className="text-xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
        <span className={clsx('absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black shadow', s.badge)}>
          {place}
        </span>
      </div>

      <p className="mt-2 w-full truncate text-center text-sm font-semibold text-white" title={name}>{name}</p>
      {region && <p className="w-full truncate text-center text-[10px] text-slate-400">{region}</p>}
      <p className={clsx('mt-1 text-xl font-black leading-none', s.label)}>
        {entry.matchPoints}
        <span className="ml-1 text-[10px] font-medium text-slate-400">pts</span>
      </p>

      <div className={clsx('mt-2 flex w-full items-start justify-center rounded-t-lg pt-1.5 shadow-lg', s.pedestal, s.glow)}>
        <span className="text-2xl font-black text-white/90 drop-shadow">{place}</span>
      </div>
    </div>
  );
}

/**
 * One-time celebratory overlay shown to a user the first time they open the app
 * after the results reveal: confetti + a staged podium of the top 3 (match points).
 */
export default function RevealCeremony() {
  const revealed = Date.now() >= RESULTS_REVEAL_AT.getTime();
  const [seen, setSeen] = useState(() => localStorage.getItem(SEEN_KEY) === '1');
  const [podium, setPodium] = useState<LeaderboardEntry[] | null>(null);
  const [stage, setStage] = useState(0); // 0 none, 1 => 3rd, 2 => 2nd, 3 => 1st

  useEffect(() => {
    if (!revealed || seen) return;
    leaderboardApi.getGlobal()
      .then(list => setPodium([...list].sort((a, b) => b.matchPoints - a.matchPoints).slice(0, 3)))
      .catch(() => setPodium([]));
  }, [revealed, seen]);

  useEffect(() => {
    if (!podium || podium.length === 0) return;
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1200),
      setTimeout(() => setStage(3), 1900),
    ];
    return () => timers.forEach(clearTimeout);
  }, [podium]);

  if (!revealed || seen || !podium || podium.length === 0) return null;

  const dismiss = () => {
    localStorage.setItem(SEEN_KEY, '1');
    setSeen(true);
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/90 px-4 backdrop-blur-sm">
      <Confetti />
      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 p-8 text-center text-white shadow-2xl ring-1 ring-white/10">
        <div className="mb-3 flex items-center justify-center gap-2 text-amber-300">
          <Trophy className="h-6 w-6" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em]">The results are in</span>
          <Trophy className="h-6 w-6" />
        </div>
        <h2 className="mb-8 text-3xl font-black sm:text-4xl">Final Podium</h2>

        <div className="flex items-end justify-center gap-3 sm:gap-5">
          {podium[1] && <Spot entry={podium[1]} place={2} visible={stage >= 2} />}
          <Spot entry={podium[0]} place={1} visible={stage >= 3} />
          {podium[2] && <Spot entry={podium[2]} place={3} visible={stage >= 1} />}
        </div>

        <button
          onClick={dismiss}
          className="mt-10 rounded-xl bg-amber-400 px-8 py-3 font-bold text-amber-950 shadow-lg transition-colors hover:bg-amber-300"
        >
          Enter the app
        </button>
      </div>
    </div>
  );
}
