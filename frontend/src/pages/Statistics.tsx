import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ClipboardList, Target, UserCheck, Star, Trophy, Globe, Crown, Medal, Award,
} from 'lucide-react';
import clsx from 'clsx';
import type { StatisticsOverview, BonusResult } from '../types';
import { statisticsApi } from '../services/api';
import { getFlagUrl } from '../utils/flags';

const hideOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.visibility = 'hidden';
};

function Flag({ code, className }: { code?: string; className?: string }) {
  if (!code) return null;
  return (
    <img
      src={getFlagUrl(code)}
      alt={code}
      onError={hideOnError}
      className={clsx('object-cover rounded-sm shadow', className)}
    />
  );
}

function KpiCard({
  icon: Icon, value, label, accent,
}: {
  icon: typeof Users; value: number; label: string; accent: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
      <Icon className={clsx('h-9 w-9 flex-shrink-0', accent)} />
      <div className="min-w-0">
        <p className={clsx('text-3xl font-extrabold leading-none', accent)}>
          {value.toLocaleString()}
        </p>
        <p className="mt-1 text-sm font-medium text-gray-300">{label}</p>
      </div>
    </div>
  );
}

const BONUS_META: Record<BonusResult['type'], {
  icon: typeof Crown; ring: string; chip: string; bar: string; text: string;
}> = {
  CHAMPION:    { icon: Crown, ring: 'ring-amber-400/40',  chip: 'bg-amber-400 text-amber-950',   bar: 'bg-amber-400',  text: 'text-amber-300' },
  RUNNER_UP:   { icon: Medal, ring: 'ring-slate-300/40',  chip: 'bg-slate-200 text-slate-800',   bar: 'bg-slate-300',  text: 'text-slate-200' },
  THIRD_PLACE: { icon: Award, ring: 'ring-orange-500/40', chip: 'bg-orange-500 text-orange-950', bar: 'bg-orange-400', text: 'text-orange-300' },
  TOP_SCORER:  { icon: Star,  ring: 'ring-sky-400/40',    chip: 'bg-sky-400 text-sky-950',       bar: 'bg-sky-400',    text: 'text-sky-300' },
};

function BonusResultCard({ result }: { result: BonusResult }) {
  const m = BONUS_META[result.type];
  const Icon = m.icon;

  return (
    <div className={clsx('flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 ring-1', m.ring)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={clsx('h-5 w-5', m.text)} />
          <h4 className="text-sm font-bold uppercase tracking-wide text-gray-100">{result.label}</h4>
        </div>
        <span className={clsx('rounded-full px-2 py-0.5 text-[10px] font-bold', m.chip)}>
          +{result.pointsEach} pts
        </span>
      </div>

      {/* Actual winner(s) */}
      {result.settled && result.winners.length > 0 ? (
        <div className="mb-5 space-y-1.5">
          {result.winners.map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              {w.code
                ? <Flag code={w.code} className="h-5 w-7" />
                : <Star className={clsx('h-4 w-4 flex-shrink-0', m.text)} />}
              <span className="truncate text-lg font-extrabold text-white" title={w.name}>{w.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-5 text-sm text-gray-500">Not settled yet</p>
      )}

      {/* Hit rate */}
      <div className="mt-auto">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-gray-400">Predicted correctly</span>
          <span className={clsx('font-bold', m.text)}>
            {result.correct}/{result.totalPicks} · {result.pct.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div className={clsx('h-full rounded-full', m.bar)} style={{ width: `${Math.min(100, result.pct)}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function Statistics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatisticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    statisticsApi.getOverview()
      .then(setStats)
      .catch((e) => {
        console.error('Failed to load statistics:', e);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-900 p-8">
        <div className="mx-auto h-8 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl bg-slate-900 p-8 text-center text-gray-300">
        Could not load statistics. Please try again later.
      </div>
    );
  }

  const hasFinishedMatches = stats.totalPredictions > 0;

  return (
    <div className="space-y-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-5 text-white sm:p-8">
      {/* Header */}
      <header className="border-b border-white/10 pb-5 text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight drop-shadow sm:text-4xl">
          World Cup Predictions Overview
        </h1>
        <p className="mt-2 text-sm text-amber-300/90">
          Final bonus results, regional performance and match accuracy — how the tournament actually played out
        </p>
      </header>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} value={stats.totalUsers} label="Users" accent="text-amber-400" />
        <KpiCard icon={ClipboardList} value={stats.totalPredictions} label="Total Predictions" accent="text-gray-100" />
        <KpiCard icon={Target} value={stats.exactScore} label="Exact Score" accent="text-green-400" />
        <KpiCard icon={UserCheck} value={stats.onlyWinner} label="Only Winner" accent="text-sky-400" />
      </div>

      {/* Bonus results — how the tournament actually ended, and who called it */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h3 className="text-base font-bold uppercase tracking-wide text-gray-100">Bonus Results</h3>
          <span className="ml-1 text-xs text-gray-400">the real podium & top scorer — and how many players nailed each</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.bonusResults?.map(r => (
            <BonusResultCard key={r.type} result={r} />
          ))}
        </div>
      </section>

      {/* Regional performance */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-400" />
          <h3 className="text-base font-bold uppercase tracking-wide text-gray-100">Regional Performance</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="py-2 pr-4 font-medium">Region</th>
                <th className="py-2 pr-4 text-right font-medium">Users</th>
                <th className="py-2 pr-4 text-right font-medium">Predictions</th>
                <th className="py-2 pr-4 text-right font-medium text-green-400">Exact Score</th>
                <th className="py-2 pr-4 text-right font-medium text-sky-400">Only Winner</th>
                <th className="py-2 pl-4 font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {stats.regions.map(r => (
                <tr key={r.region} className="border-b border-white/5">
                  <td className="py-2 pr-4">
                    <span className="flex items-center gap-2 font-medium text-gray-100">
                      <Globe className="h-3.5 w-3.5 text-green-500/70" />
                      {r.regionDisplayName}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-right text-gray-200">{r.usersWithPredictions}</td>
                  <td className="py-2 pr-4 text-right text-gray-200">{r.totalPredictions}</td>
                  <td className="py-2 pr-4 text-right font-semibold text-green-400">{r.exactScore}</td>
                  <td className="py-2 pr-4 text-right font-semibold text-sky-400">{r.onlyWinner}</td>
                  <td className="py-2 pl-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-24 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-green-500" style={{ width: `${r.sharePct}%` }} />
                      </div>
                      <span className="w-12 text-right text-xs text-gray-400">{r.sharePct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-white/20 font-bold">
                <td className="py-2 pr-4 text-gray-100">{stats.regionsTotal.regionDisplayName}</td>
                <td className="py-2 pr-4 text-right text-gray-100">{stats.regionsTotal.usersWithPredictions}</td>
                <td className="py-2 pr-4 text-right text-gray-100">{stats.regionsTotal.totalPredictions}</td>
                <td className="py-2 pr-4 text-right text-green-400">{stats.regionsTotal.exactScore}</td>
                <td className="py-2 pr-4 text-right text-sky-400">{stats.regionsTotal.onlyWinner}</td>
                <td className="py-2 pl-4 text-xs text-gray-400">{stats.regionsTotal.sharePct.toFixed(0)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Match accuracy */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-green-400" />
          <h3 className="text-base font-bold uppercase tracking-wide text-gray-100">Match Prediction Accuracy</h3>
        </div>

        {!hasFinishedMatches || stats.matches.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            No matches have been played yet. Accuracy stats will appear here once results are in.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.matches.map(m => (
              <div
                key={m.matchNumber}
                onClick={() => navigate(`/statistics/match/${m.matchNumber}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/statistics/match/${m.matchNumber}`); }}
                title="View who predicted exact / correct winner"
                className="cursor-pointer rounded-xl border border-white/10 bg-slate-800/50 p-4 transition-colors hover:border-amber-400/50 hover:bg-slate-800"
              >
                <div className="mb-3 flex items-center justify-center gap-1 text-[11px] uppercase tracking-wide text-gray-400">
                  Match {m.matchNumber} · {m.stage.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex w-20 flex-col items-center gap-1">
                    <Flag code={m.homeTeam?.code} className="h-7 w-11" />
                    <span className="text-xs font-bold text-gray-200">{m.homeTeam?.code ?? '—'}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-white">{m.homeScore} - {m.awayScore}</div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-500">Final</div>
                  </div>
                  <div className="flex w-20 flex-col items-center gap-1">
                    <Flag code={m.awayTeam?.code} className="h-7 w-11" />
                    <span className="text-xs font-bold text-gray-200">{m.awayTeam?.code ?? '—'}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
                  <div>
                    <p className="text-sm font-bold text-gray-100">{m.predictions}</p>
                    <p className="text-[10px] uppercase text-gray-500">Predictions</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-400">{m.exactScore}</p>
                    <p className="text-[10px] uppercase text-gray-500">Exact ({m.exactPct.toFixed(1)}%)</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-sky-400">{m.correctWinner}</p>
                    <p className="text-[10px] uppercase text-gray-500">Winner ({m.correctWinnerPct.toFixed(1)}%)</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="pt-2 text-center text-xs italic text-gray-500">
        Percentages may not sum to 100 due to rounding. Match figures count played matches only.
      </p>
    </div>
  );
}
