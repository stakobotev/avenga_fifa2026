import { useEffect, useState } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Target, UserCheck } from 'lucide-react';
import clsx from 'clsx';
import { statisticsApi } from '../services/api';
import { getFlagUrl } from '../utils/flags';
import type { MatchPredictionBreakdown, MatchPredictionUser } from '../types';

function Flag({ code, className }: { code?: string; className?: string }) {
  if (!code) return null;
  return (
    <img
      src={getFlagUrl(code)}
      alt={code}
      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
      className={clsx('object-cover rounded-sm shadow', className)}
    />
  );
}

function UserList({
  title, icon: Icon, accent, users,
}: {
  title: string;
  icon: typeof Target;
  accent: string;
  users: MatchPredictionUser[];
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className={clsx('h-5 w-5', accent)} />
        <h3 className="text-base font-bold uppercase tracking-wide text-gray-100">{title}</h3>
        <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-sm font-semibold text-gray-100">
          {users.length}
        </span>
      </div>
      {users.length === 0 ? (
        <p className="text-sm text-gray-500">No one.</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {users.map(u => (
            <li key={u.userId} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-100">{u.displayName || u.username}</p>
                {u.regionDisplayName && (
                  <p className="truncate text-xs text-gray-400">{u.regionDisplayName}</p>
                )}
              </div>
              <span className="flex-shrink-0 rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-gray-100">
                {u.predictedHomeScore} - {u.predictedAwayScore}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function MatchPredictionStats() {
  const { matchNumber } = useParams();
  const [data, setData] = useState<MatchPredictionBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const num = Number(matchNumber);

  useEffect(() => {
    if (!Number.isFinite(num)) return;
    setLoading(true);
    statisticsApi.getMatchBreakdown(num)
      .then(setData)
      .catch((e) => { console.error('Failed to load match breakdown:', e); setError(true); })
      .finally(() => setLoading(false));
  }, [num]);

  if (!Number.isFinite(num)) {
    return <Navigate to="/statistics" replace />;
  }

  return (
    <div className="space-y-4">
      <Link to="/statistics" className="inline-flex items-center text-sm text-gray-600 hover:text-avenga-red">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Statistics
      </Link>

      <div className="space-y-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-5 text-white sm:p-8">
        {loading ? (
          <div className="space-y-4">
            <div className="mx-auto h-8 w-1/2 animate-pulse rounded bg-white/10" />
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="h-64 animate-pulse rounded-xl bg-white/10" />
              <div className="h-64 animate-pulse rounded-xl bg-white/10" />
            </div>
          </div>
        ) : error || !data ? (
          <p className="text-center text-gray-300">Could not load this match's predictions.</p>
        ) : (
          <>
            {/* Match header */}
            <header className="border-b border-white/10 pb-5">
              <p className="text-center text-[11px] uppercase tracking-wide text-gray-400">
                Match {data.matchNumber} · {data.stage.replace(/_/g, ' ')}
              </p>
              <div className="mt-3 flex items-center justify-center gap-6">
                <div className="flex w-24 flex-col items-center gap-1">
                  <Flag code={data.homeTeam?.code} className="h-8 w-12" />
                  <span className="text-sm font-bold text-gray-200">{data.homeTeam?.code ?? '—'}</span>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-extrabold">{data.homeScore} - {data.awayScore}</div>
                  <div className="text-[10px] uppercase tracking-wide text-gray-500">Final</div>
                </div>
                <div className="flex w-24 flex-col items-center gap-1">
                  <Flag code={data.awayTeam?.code} className="h-8 w-12" />
                  <span className="text-sm font-bold text-gray-200">{data.awayTeam?.code ?? '—'}</span>
                </div>
              </div>
            </header>

            <div className="grid gap-6 sm:grid-cols-2">
              <UserList
                title="Exact Score"
                icon={Target}
                accent="text-green-400"
                users={data.exactScorers}
              />
              <UserList
                title="Correct Winner (not exact)"
                icon={UserCheck}
                accent="text-sky-400"
                users={data.winnerScorers}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
