import { useEffect, useMemo, useState } from 'react';
import { Trophy, Target, CheckCircle2, XCircle, Award, TrendingUp, Calendar, Info, Crown, Medal, Star } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';
import { predictionApi, leaderboardApi } from '../services/api';
import type { Prediction, BonusPrediction, LeaderboardEntry, Match } from '../types';

const FIFA_TO_ISO: Record<string, string> = {
  USA: 'us', MEX: 'mx', CAN: 'ca', JAM: 'jm', CRC: 'cr', PAN: 'pa', HON: 'hn', SLV: 'sv', GUA: 'gt', HAI: 'ht', TRI: 'tt', CUB: 'cu',
  ARG: 'ar', BRA: 'br', URU: 'uy', COL: 'co', CHI: 'cl', ECU: 'ec', PER: 'pe', VEN: 've', PAR: 'py', BOL: 'bo',
  GER: 'de', FRA: 'fr', ENG: 'gb-eng', ESP: 'es', ITA: 'it', NED: 'nl', POR: 'pt', BEL: 'be', SUI: 'ch', AUT: 'at',
  WAL: 'gb-wls', SCO: 'gb-sct', NIR: 'gb-nir', IRL: 'ie',
  DEN: 'dk', SWE: 'se', NOR: 'no', FIN: 'fi', ISL: 'is',
  POL: 'pl', CZE: 'cz', SVK: 'sk', HUN: 'hu', UKR: 'ua',
  CRO: 'hr', SRB: 'rs', SLO: 'si', BIH: 'ba', MNE: 'me', ALB: 'al', MKD: 'mk', KOS: 'xk', GRE: 'gr', CYP: 'cy',
  ROU: 'ro', BUL: 'bg', TUR: 'tr', RUS: 'ru', GEO: 'ge', ARM: 'am', AZE: 'az',
  JPN: 'jp', KOR: 'kr', AUS: 'au', IRN: 'ir', KSA: 'sa', QAT: 'qa', UAE: 'ae', CHN: 'cn', IND: 'in', IDN: 'id',
  IRQ: 'iq', SYR: 'sy', JOR: 'jo', OMA: 'om', BHR: 'bh', KUW: 'kw', UZB: 'uz', THA: 'th', VIE: 'vn', MAS: 'my',
  MAR: 'ma', SEN: 'sn', NGA: 'ng', EGY: 'eg', GHA: 'gh', CMR: 'cm', CIV: 'ci', ALG: 'dz', TUN: 'tn', RSA: 'za',
  MLI: 'ml', BFA: 'bf', COD: 'cd', ZAM: 'zm', ZIM: 'zw', ANG: 'ao', MOZ: 'mz', UGA: 'ug', KEN: 'ke', TAN: 'tz',
  NZL: 'nz',
  CUW: 'cw', CPV: 'cv',
};

const getFlagUrl = (code?: string): string | undefined => {
  if (!code) return undefined;
  const isoCode = FIFA_TO_ISO[code] || code.toLowerCase().slice(0, 2);
  return `https://flagcdn.com/24x18/${isoCode}.png`;
};

const STAGE_LABELS: Record<Match['stage'], string> = {
  GROUP: 'Group Stage',
  ROUND_OF_32: 'Round of 32',
  ROUND_OF_16: 'Round of 16',
  QUARTERFINAL: 'Quarter-finals',
  SEMIFINAL: 'Semi-finals',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
};

const STAGE_ORDER: Match['stage'][] = ['GROUP', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'THIRD_PLACE', 'FINAL'];

const BONUS_LABELS: Record<BonusPrediction['predictionType'], { label: string; points: number; icon: typeof Crown }> = {
  CHAMPION: { label: 'Champion', points: 15, icon: Crown },
  RUNNER_UP: { label: 'Runner-up', points: 10, icon: Medal },
  THIRD_PLACE: { label: 'Third Place', points: 8, icon: Award },
  TOP_SCORER: { label: 'Top Scorer', points: 10, icon: Star },
};

type PointReason =
  | 'GROUP_EXACT'
  | 'GROUP_RESULT'
  | 'KO_EXACT'
  | 'KO_ADVANCING'
  | 'KO_RESULT_ONLY'
  | 'NONE';

interface ScoringOutcome {
  reason: PointReason;
  points: number;
  explanation: string;
}

function getResult(home: number, away: number): 0 | 1 | 2 {
  if (home > away) return 1;
  if (home < away) return 2;
  return 0;
}

function explainPrediction(pred: Prediction): ScoringOutcome | null {
  const match = pred.match;
  if (match.homeScore == null || match.awayScore == null) return null;

  const predHome = pred.predictedHomeScore;
  const predAway = pred.predictedAwayScore;
  const actHome = match.homeScore;
  const actAway = match.awayScore;

  const exactScore = predHome === actHome && predAway === actAway;
  const correctResult = getResult(predHome, predAway) === getResult(actHome, actAway);

  if (match.stage === 'GROUP') {
    if (exactScore) {
      return { reason: 'GROUP_EXACT', points: 5, explanation: 'Exact score predicted — group stage bonus' };
    }
    if (correctResult) {
      return { reason: 'GROUP_RESULT', points: 3, explanation: 'Correct match result (1X2) — wrong scoreline' };
    }
    return { reason: 'NONE', points: 0, explanation: 'Wrong result — no points awarded' };
  }

  const predictedAdvancingId = pred.predictedAdvancingTeam?.id;
  const actualWinnerId = match.winnerTeam?.id;
  const correctAdvancing = predictedAdvancingId != null && predictedAdvancingId === actualWinnerId;

  if (exactScore) {
    return { reason: 'KO_EXACT', points: 5, explanation: 'Exact 90-min score — knockout bonus' };
  }
  if (correctAdvancing) {
    return { reason: 'KO_ADVANCING', points: 4, explanation: 'Correct advancing team' };
  }
  if (correctResult) {
    return { reason: 'KO_RESULT_ONLY', points: 2, explanation: 'Correct 90-min result, wrong advancing team' };
  }
  return { reason: 'NONE', points: 0, explanation: 'Wrong result and wrong advancing team' };
}

function TeamBadge({ code, name }: { code?: string; name?: string }) {
  const flag = getFlagUrl(code);
  return (
    <span className="inline-flex items-center gap-1.5">
      {flag && <img src={flag} alt={name || code} className="w-5 h-4 object-contain rounded shadow-sm" />}
      <span className="font-medium">{code || name || 'TBD'}</span>
    </span>
  );
}

interface BreakdownRow {
  key: PointReason | BonusPrediction['predictionType'];
  label: string;
  count: number;
  pointsEach: number;
  total: number;
  color: string;
}

interface MyPredictionsProps {
  // When set (admin viewing another user from the leaderboard), load that user's
  // data instead of the logged-in user's. Omitted for the normal "my" view.
  userId?: number;
  displayName?: string;
}

export default function MyPredictions({ userId, displayName }: MyPredictionsProps = {}) {
  const { user } = useAuthStore();
  const isViewingOther = userId != null;
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [bonusPredictions, setBonusPredictions] = useState<BonusPrediction[]>([]);
  const [stats, setStats] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SCORED' | 'PENDING'>('ALL');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [preds, bonus, entry] = await Promise.all([
          isViewingOther ? predictionApi.getUserPredictions(userId) : predictionApi.getMyPredictions(),
          isViewingOther ? predictionApi.getUserBonusPredictions(userId) : predictionApi.getMyBonusPredictions(),
          // Stats for another user come from the global leaderboard (gives rank too).
          isViewingOther
            ? leaderboardApi.getGlobal().then(list => list.find(e => e.user.id === userId) ?? null)
            : leaderboardApi.getMyStats(),
        ]);
        setPredictions(preds);
        setBonusPredictions(bonus);
        setStats(entry);
      } catch (err) {
        console.error('Failed to load predictions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isViewingOther, userId]);

  const headerName = isViewingOther
    ? (displayName ?? stats?.user?.displayName ?? stats?.user?.username ?? 'User')
    : (user?.displayName ?? user?.username ?? 'You');

  const breakdown = useMemo<BreakdownRow[]>(() => {
    const counts: Record<PointReason, number> = {
      GROUP_EXACT: 0, GROUP_RESULT: 0, KO_EXACT: 0, KO_ADVANCING: 0, KO_RESULT_ONLY: 0, NONE: 0,
    };
    predictions.forEach(p => {
      if (!p.scored) return;
      const outcome = explainPrediction(p);
      if (outcome) counts[outcome.reason] += 1;
    });

    const rows: BreakdownRow[] = [
      { key: 'GROUP_EXACT', label: 'Group — Exact Score', count: counts.GROUP_EXACT, pointsEach: 5, total: counts.GROUP_EXACT * 5, color: 'text-green-600 bg-green-50' },
      { key: 'GROUP_RESULT', label: 'Group — Correct Result', count: counts.GROUP_RESULT, pointsEach: 3, total: counts.GROUP_RESULT * 3, color: 'text-yellow-600 bg-yellow-50' },
      { key: 'KO_EXACT', label: 'Knockout — Exact Score', count: counts.KO_EXACT, pointsEach: 5, total: counts.KO_EXACT * 5, color: 'text-green-600 bg-green-50' },
      { key: 'KO_ADVANCING', label: 'Knockout — Correct Advancing', count: counts.KO_ADVANCING, pointsEach: 4, total: counts.KO_ADVANCING * 4, color: 'text-blue-600 bg-blue-50' },
      { key: 'KO_RESULT_ONLY', label: 'Knockout — Result Only', count: counts.KO_RESULT_ONLY, pointsEach: 2, total: counts.KO_RESULT_ONLY * 2, color: 'text-yellow-600 bg-yellow-50' },
    ];

    bonusPredictions.filter(b => b.scored && (b.pointsEarned ?? 0) > 0).forEach(b => {
      const meta = BONUS_LABELS[b.predictionType];
      rows.push({
        key: b.predictionType,
        label: `Bonus — ${meta.label}`,
        count: 1,
        pointsEach: meta.points,
        total: b.pointsEarned ?? meta.points,
        color: 'text-purple-600 bg-purple-50',
      });
    });

    return rows.filter(r => r.count > 0);
  }, [predictions, bonusPredictions]);

  const totalFromBreakdown = breakdown.reduce((sum, r) => sum + r.total, 0);

  const groupedByStage = useMemo(() => {
    const filtered = predictions.filter(p => {
      if (filter === 'SCORED') return p.scored;
      if (filter === 'PENDING') return !p.scored;
      return true;
    });
    const map = new Map<Match['stage'], Prediction[]>();
    filtered.forEach(p => {
      const stage = p.match.stage;
      if (!map.has(stage)) map.set(stage, []);
      map.get(stage)!.push(p);
    });
    map.forEach(list => list.sort((a, b) =>
      new Date(a.match.matchDate).getTime() - new Date(b.match.matchDate).getTime()
    ));
    return map;
  }, [predictions, filter]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded-2xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  const scoredCount = predictions.filter(p => p.scored).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-900 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {isViewingOther ? `${headerName}'s Predictions` : 'My Predictions'}
            </h1>
            <p className="text-purple-200">
              {isViewingOther
                ? `Viewing ${headerName}'s prediction history (admin)`
                : `${headerName === 'You' ? 'Your' : `${headerName}'s`} prediction history and how every point was earned`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-avenga-red">{stats?.totalPoints ?? 0}</div>
            <p className="text-purple-200 text-sm">Total Points · Rank #{stats?.rank ?? '-'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <Trophy className="h-8 w-8 text-avenga-red mx-auto mb-2" />
          <p className="text-3xl font-bold">{stats?.matchPoints ?? 0}</p>
          <p className="text-sm text-gray-500">Match Points</p>
        </div>
        <div className="card text-center">
          <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{stats?.bonusPoints ?? 0}</p>
          <p className="text-sm text-gray-500">Bonus Points</p>
        </div>
        <div className="card text-center">
          <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{stats?.exactScores ?? 0}</p>
          <p className="text-sm text-gray-500">Exact Scores</p>
        </div>
        <div className="card text-center">
          <CheckCircle2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-3xl font-bold">{stats?.correctPredictions ?? 0}</p>
          <p className="text-sm text-gray-500">Correct Predictions</p>
        </div>
      </div>

      {/* Points Breakdown — the "why" */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-avenga-red" />
            How Your Points Were Earned
          </h2>
          <span className="text-sm text-gray-500">{scoredCount} of {predictions.length} predictions scored</span>
        </div>

        {breakdown.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Info className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p>No points earned yet. As matches finish, you'll see exactly where every point came from.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {breakdown.map(row => (
                <div key={row.key} className={clsx('flex items-center justify-between p-3 rounded-lg', row.color)}>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{row.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/70">
                      {row.count} × {row.pointsEach} pts
                    </span>
                  </div>
                  <span className="font-bold text-lg">+{row.total}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total from breakdown</span>
              <span className="text-2xl font-bold text-avenga-red">{totalFromBreakdown} pts</span>
            </div>
          </>
        )}
      </div>

      {/* Bonus Predictions */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-purple-500" />
          Bonus Predictions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['CHAMPION', 'RUNNER_UP', 'THIRD_PLACE', 'TOP_SCORER'] as BonusPrediction['predictionType'][]).map(type => {
            const pred = bonusPredictions.find(b => b.predictionType === type);
            const meta = BONUS_LABELS[type];
            const Icon = meta.icon;
            const earned = pred?.pointsEarned ?? 0;
            const isWin = pred?.scored && earned > 0;
            const isLoss = pred?.scored && earned === 0;
            return (
              <div
                key={type}
                className={clsx(
                  'p-4 rounded-lg border-2',
                  isWin ? 'border-green-300 bg-green-50' :
                  isLoss ? 'border-red-200 bg-red-50' :
                  'border-gray-200 bg-gray-50'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-gray-900">{meta.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">worth {meta.points} pts</span>
                </div>
                {pred ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      {pred.selectedTeam && <TeamBadge code={pred.selectedTeam.code} name={pred.selectedTeam.name} />}
                      {pred.selectedPlayerName && <span className="font-medium">{pred.selectedPlayerName}</span>}
                    </div>
                    {pred.scored ? (
                      <span className={clsx('font-bold', isWin ? 'text-green-600' : 'text-red-600')}>
                        {isWin ? `+${earned}` : '0'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Pending</span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Not selected</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Match Predictions */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Match Predictions
          </h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['ALL', 'SCORED', 'PENDING'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  filter === f ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {f === 'ALL' ? 'All' : f === 'SCORED' ? 'Scored' : 'Pending'}
              </button>
            ))}
          </div>
        </div>

        {predictions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p>You haven't made any predictions yet.</p>
          </div>
        ) : groupedByStage.size === 0 ? (
          <p className="text-center py-8 text-gray-500">No predictions match this filter.</p>
        ) : (
          <div className="space-y-6">
            {STAGE_ORDER.filter(s => groupedByStage.has(s)).map(stage => (
              <div key={stage}>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  {STAGE_LABELS[stage]}
                </h3>
                <div className="space-y-2">
                  {groupedByStage.get(stage)!.map(pred => {
                    const outcome = pred.scored ? explainPrediction(pred) : null;
                    const earned = pred.pointsEarned ?? outcome?.points ?? 0;
                    const isWin = pred.scored && earned > 0;
                    const isLoss = pred.scored && earned === 0;
                    const match = pred.match;

                    return (
                      <div
                        key={pred.id}
                        className={clsx(
                          'p-3 rounded-lg border-l-4',
                          isWin ? 'border-green-500 bg-green-50' :
                          isLoss ? 'border-red-400 bg-red-50' :
                          'border-gray-300 bg-gray-50'
                        )}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <TeamBadge code={match.homeTeam?.code} name={match.homeTeam?.name} />
                            <span className="text-gray-400 text-sm">vs</span>
                            <TeamBadge code={match.awayTeam?.code} name={match.awayTeam?.name} />
                            {match.groupLetter && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                Group {match.groupLetter}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm flex-wrap">
                            <span className="text-gray-600">
                              You: <span className="font-semibold">{pred.predictedHomeScore}-{pred.predictedAwayScore}</span>
                            </span>
                            {match.homeScore != null && match.awayScore != null ? (
                              <span className="text-gray-600">
                                Actual: <span className="font-semibold">{match.homeScore}-{match.awayScore}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Not played</span>
                            )}
                            {pred.scored && (
                              <span className={clsx(
                                'font-bold text-lg flex items-center gap-1',
                                isWin ? 'text-green-600' : 'text-red-600'
                              )}>
                                {isWin ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                {isWin ? `+${earned}` : '0'}
                              </span>
                            )}
                          </div>
                        </div>
                        {pred.scored && outcome && (
                          <p className="mt-2 text-xs text-gray-600 italic flex items-start gap-1">
                            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            {outcome.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scoring rules reference */}
      <div className="card bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center">
          <Info className="h-4 w-4 mr-2" />
          Scoring Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-semibold text-gray-800 mb-1">Group Stage</p>
            <ul className="text-gray-600 space-y-0.5 list-disc list-inside">
              <li>Exact score: <span className="font-semibold">5 pts</span></li>
              <li>Correct result (1X2): <span className="font-semibold">3 pts</span></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">Knockout Stage</p>
            <ul className="text-gray-600 space-y-0.5 list-disc list-inside">
              <li>Exact 90-min score: <span className="font-semibold">5 pts</span></li>
              <li>Correct advancing team: <span className="font-semibold">4 pts</span></li>
              <li>Correct result, wrong advancing: <span className="font-semibold">2 pts</span></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="font-semibold text-gray-800 mb-1">Bonus Predictions</p>
            <ul className="text-gray-600 space-y-0.5 list-disc list-inside">
              <li>Champion: <span className="font-semibold">15 pts</span></li>
              <li>Runner-up: <span className="font-semibold">10 pts</span></li>
              <li>Third Place: <span className="font-semibold">8 pts</span></li>
              <li>Top Scorer: <span className="font-semibold">10 pts</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
