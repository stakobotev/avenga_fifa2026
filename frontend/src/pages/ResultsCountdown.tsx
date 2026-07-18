import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { Lock, Trophy, LogOut, Sparkles, Users, Target, ListChecks, Mail } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { isDevMode, devAuthApi } from '../config/devAuth';
import { revealApi, type RevealTeaser, type RevealEnvelope } from '../services/api';
import { RESULTS_REVEAL_AT, RESULTS_REVEAL_LABEL } from '../config/reveal';
import { getFlagUrl } from '../utils/flags';
import AvengaLogo from '../components/AvengaLogo';

const HYPE_QUOTES = [
  'Every prediction is locked. Every point is counted. Only the reveal remains.',
  'Somewhere in the standings, a champion is waiting to be crowned.',
  'The bravest picks are about to pay off — or not.',
  'One table. Three podium spots. Countless dreams.',
  'No more predictions. Just destiny doing the math.',
  'The group stage was the warm-up. This is the reckoning.',
  'Glory is measured in points. The final tally is almost here.',
];

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const totalSec = Math.floor(diffMs / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    done: diffMs === 0,
  };
}

function Segment({ value, label }: { value: number; label: string }) {
  const padded = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-16 rounded-xl bg-white/5 px-2 py-3 text-center ring-1 ring-white/10 shadow-lg sm:w-24 sm:py-5"
        style={{ perspective: '400px' }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/30" />
        {/* keyed span re-mounts on change -> flip animation fires */}
        <span
          key={padded}
          className="relative block font-mono text-3xl font-black tabular-nums text-white drop-shadow sm:text-5xl"
          style={{ animation: 'seg-flip 0.5s ease-out', transformOrigin: 'center top' }}
        >
          {padded}
        </span>
      </div>
      <span className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:text-xs">
        {label}
      </span>
      <style>{`
        @keyframes seg-flip {
          0%   { transform: rotateX(-90deg); opacity: 0; }
          55%  { transform: rotateX(15deg);  opacity: 1; }
          100% { transform: rotateX(0deg);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function StatChip({ icon: Icon, value, label }: { icon: typeof Users; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
      <Icon className="h-4 w-4 flex-shrink-0 text-amber-400" />
      <div className="leading-tight">
        <div className="text-sm font-bold text-white">{value}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      </div>
    </div>
  );
}

export default function ResultsCountdown() {
  const { days, hours, minutes, seconds, done } = useCountdown(RESULTS_REVEAL_AT);
  const { user, clearUser } = useAuthStore();
  const { instance } = useMsal();
  const navigate = useNavigate();
  const isDev = isDevMode();

  const [teaser, setTeaser] = useState<RevealTeaser | null>(null);
  const [envelope, setEnvelope] = useState<RevealEnvelope | null>(null);
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    revealApi.getTeaser().then(setTeaser).catch(() => setTeaser(null));
    revealApi.getMyEnvelope().then(setEnvelope).catch(() => setEnvelope(null));
  }, []);

  // Rotate the hype quotes.
  useEffect(() => {
    const id = setInterval(() => setQuoteIdx(i => (i + 1) % HYPE_QUOTES.length), 4500);
    return () => clearInterval(id);
  }, []);

  const progressPct = useMemo(() => {
    const windowMs = 3 * 86400 * 1000;
    const remaining = Math.max(0, RESULTS_REVEAL_AT.getTime() - Date.now());
    return Math.min(100, Math.max(0, (1 - remaining / windowMs) * 100));
  }, [days, hours, minutes, seconds]);

  const handleLogout = async () => {
    clearUser();
    if (isDev) {
      await devAuthApi.logout();
      navigate('/login');
    } else {
      instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-purple-950 via-slate-950 to-slate-950 px-4 py-10 text-white">
      {/* Ambient animated glows */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 animate-pulse rounded-full bg-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-600/20 blur-3xl [animation-delay:1s]" />

      <button
        onClick={handleLogout}
        className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <AvengaLogo className="mb-8 h-6 w-auto text-avenga-red" />

        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-400/10 ring-2 ring-amber-400/40 shadow-[0_0_40px] shadow-amber-500/30">
          <Lock className="h-9 w-9 text-amber-400" />
        </div>

        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
          <Sparkles className="h-4 w-4" />
          The results are sealed
          <Sparkles className="h-4 w-4" />
        </p>

        <h1 className="mb-3 text-3xl font-black leading-tight sm:text-5xl">
          {done ? 'The wait is over!' : 'Final standings incoming'}
        </h1>
        <p className="mb-8 max-w-md text-sm text-slate-300 sm:text-base">
          {done
            ? 'The champions are being crowned — refreshing your podium…'
            : `The tournament has reached the final whistle. Every ranking is locked away until the grand reveal on ${RESULTS_REVEAL_LABEL}.`}
        </p>

        {!done && (
          <>
            {/* Countdown */}
            <div className="flex items-start justify-center gap-2 sm:gap-4">
              <Segment value={days} label="Days" />
              <span className="pt-2 text-3xl font-black text-slate-600 sm:pt-4 sm:text-5xl">:</span>
              <Segment value={hours} label="Hours" />
              <span className="pt-2 text-3xl font-black text-slate-600 sm:pt-4 sm:text-5xl">:</span>
              <Segment value={minutes} label="Minutes" />
              <span className="pt-2 text-3xl font-black text-slate-600 sm:pt-4 sm:text-5xl">:</span>
              <Segment value={seconds} label="Seconds" />
            </div>

            {/* Rotating hype quote */}
            <div className="mt-6 flex h-10 items-center justify-center px-4">
              <p key={quoteIdx} className="text-sm italic text-slate-300 [animation:fade-in_0.6s_ease-out]">
                “{HYPE_QUOTES[quoteIdx]}”
              </p>
            </div>

            {/* Progress bar */}
            <div className="mt-4 w-full max-w-md">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Trophy className="h-4 w-4 text-amber-400" />
                Unsealing on {RESULTS_REVEAL_LABEL}
              </div>
            </div>

            {/* Spoiler-free teaser stats */}
            {teaser && (
              <div className="mt-10 w-full">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  While you wait
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <StatChip icon={Users} value={teaser.totalPlayers} label="Players" />
                  <StatChip icon={ListChecks} value={teaser.totalPredictions} label="Predictions" />
                  <StatChip icon={Target} value={teaser.matchesPlayed} label="Matches played" />
                  {teaser.favoriteChampionCode && (
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                      <img
                        src={getFlagUrl(teaser.favoriteChampionCode)}
                        alt={teaser.favoriteChampionName || teaser.favoriteChampionCode}
                        className="h-4 w-6 flex-shrink-0 rounded-sm object-cover shadow"
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                      />
                      <div className="leading-tight">
                        <div className="text-sm font-bold text-white">{teaser.favoriteChampionName}</div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400">Crowd's champion</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Personal sealed envelope */}
            {envelope && (
              <div className="mt-6 w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 p-5 ring-1 ring-amber-400/20">
                <div className="mb-3 flex items-center justify-center gap-2 text-amber-300">
                  <Mail className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest">Your sealed envelope</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-black text-white">{envelope.predictionsMade}</div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Predictions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">{envelope.exactScores}</div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Exact scores</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">{envelope.bonusPredictionsMade}</div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Bonus picks</div>
                  </div>
                </div>
                <p className="mt-3 text-center text-[11px] text-slate-400">
                  Sealed under {envelope.displayName}{envelope.region ? ` · ${envelope.region}` : ''}. Final rank revealed at the whistle.
                </p>
              </div>
            )}
          </>
        )}

        {done && (
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-amber-400 px-6 py-3 font-bold text-amber-950 shadow-lg transition-colors hover:bg-amber-300"
          >
            See the final results
          </button>
        )}

        <p className="mt-12 text-xs text-slate-500">
          Signed in as {user?.displayName || user?.username}
        </p>
      </div>

      <style>{`@keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
