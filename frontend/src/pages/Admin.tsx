import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Trophy, RotateCcw, Clock, Check, AlertCircle, RefreshCw, Wifi, WifiOff, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { matchApi, adminApi, teamApi, type SyncStatus, type CheckResultResponse } from '../services/api';
import type { Match, Team } from '../types';
import { computeGroupStandings } from '../utils/standings';
import clsx from 'clsx';

export default function Admin() {
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'finished' | 'knockout' | 'verify'>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Redirect non-admin users
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchMatches();
    fetchTeams();
    fetchSyncStatus();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await matchApi.getAll();
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const data = await teamApi.getAll();
      // Sort alphabetically for easier scanning in the dropdowns.
      setTeams([...data].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const status = await adminApi.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const result = await adminApi.triggerSync();
      showMessage('success', result.message);
      await fetchSyncStatus();
      if (result.updated > 0) {
        await fetchMatches();
      }
    } catch (error) {
      showMessage('error', 'Failed to trigger sync');
    } finally {
      setSyncing(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSetMatchDate = async (matchId: number, hoursFromNow: number) => {
    setActionLoading(matchId);
    try {
      const newDate = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
      // Send full ISO string with Z suffix to indicate UTC
      await adminApi.updateMatchDate(matchId, newDate.toISOString());
      await fetchMatches();
      showMessage('success', `Match date updated to ${hoursFromNow > 0 ? `${hoursFromNow}h from now` : `${Math.abs(hoursFromNow)}h ago`}`);
    } catch (error) {
      showMessage('error', 'Failed to update match date');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetResult = async (
    matchId: number,
    homeScore: number,
    awayScore: number,
    extra?: { homePenaltyScore?: number; awayPenaltyScore?: number; winnerTeamId?: number },
  ) => {
    setActionLoading(matchId);
    try {
      await adminApi.updateMatchResult(matchId, { homeScore, awayScore, ...extra });
      await fetchMatches();
      showMessage('success', `Result set: ${homeScore} - ${awayScore}`);
    } catch (error) {
      showMessage('error', 'Failed to set result');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetTeams = async (matchId: number, homeTeamId?: number, awayTeamId?: number) => {
    setActionLoading(matchId);
    try {
      await adminApi.updateMatchTeams(matchId, { homeTeamId, awayTeamId });
      await fetchMatches();
      showMessage('success', 'Teams updated');
    } catch (error) {
      const e = error as { response?: { data?: { message?: string } } };
      showMessage('error', e.response?.data?.message || 'Failed to update teams');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetMatch = async (matchId: number) => {
    setActionLoading(matchId);
    try {
      await adminApi.resetMatch(matchId);
      await fetchMatches();
      showMessage('success', 'Match reset successfully');
    } catch (error) {
      showMessage('error', 'Failed to reset match');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'scheduled') return match.status === 'SCHEDULED';
    if (filter === 'finished') return match.status === 'FINISHED';
    if (filter === 'verify') return match.status === 'FINISHED';
    if (filter === 'knockout') return match.stage !== 'GROUP';
    return true;
  });

  // Current 3rd-placed team in each group — the only teams eligible for R32 "3rd" slots.
  const thirdPlaceTeams = useMemo(() => {
    const groupLetters = Array.from(
      new Set(teams.map(t => t.groupLetter).filter((g): g is string => !!g))
    ).sort();
    const thirds: Team[] = [];
    for (const g of groupLetters) {
      const groupTeams = teams.filter(t => t.groupLetter === g);
      const groupMatches = matches.filter(m => m.stage === 'GROUP' && m.groupLetter === g);
      const standings = computeGroupStandings(groupTeams, groupMatches);
      if (standings.length >= 3) thirds.push(standings[2].team);
    }
    return thirds;
  }, [teams, matches]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <div className="flex items-center space-x-2">
          {(['all', 'scheduled', 'finished', 'knockout', 'verify'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-all capitalize',
                filter === f
                  ? 'bg-avenga-red text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={clsx(
          'p-4 rounded-lg flex items-center',
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        )}>
          {message.type === 'success' ? <Check className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
          {message.text}
        </div>
      )}

      {/* Auto-Sync Status Panel */}
      <div className={clsx(
        'card border-l-4',
        syncStatus?.enabled ? 'border-l-green-500' : 'border-l-gray-400'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {syncStatus?.enabled ? (
              <Wifi className="h-6 w-6 text-green-500 mr-3" />
            ) : (
              <WifiOff className="h-6 w-6 text-gray-400 mr-3" />
            )}
            <div>
              <h3 className="font-bold text-gray-900">Football-Data.org Auto-Sync</h3>
              <p className="text-sm text-gray-500">
                {syncStatus?.enabled
                  ? 'Automatic match result updates are enabled'
                  : 'Auto-sync is disabled. Configure FOOTBALL_DATA_API_KEY to enable.'}
              </p>
            </div>
          </div>

          {syncStatus?.enabled && (
            <button
              onClick={handleTriggerSync}
              disabled={syncing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={clsx('h-4 w-4 mr-2', syncing && 'animate-spin')} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>

        {syncStatus?.enabled && syncStatus.lastSyncResult && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Last Sync:</span>
                <p className="font-medium">
                  {syncStatus.lastSyncAttempt
                    ? new Date(syncStatus.lastSyncAttempt).toLocaleString()
                    : 'Never'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Processed:</span>
                <p className="font-medium">{syncStatus.lastSyncResult.processed} matches</p>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>
                <p className="font-medium text-green-600">{syncStatus.lastSyncResult.updated} matches</p>
              </div>
              <div>
                <span className="text-gray-500">Errors:</span>
                <p className={clsx(
                  'font-medium',
                  syncStatus.lastSyncResult.errors > 0 ? 'text-red-600' : 'text-gray-600'
                )}>
                  {syncStatus.lastSyncResult.errors}
                </p>
              </div>
            </div>
            {syncStatus.lastSyncResult.message && (
              <p className="mt-2 text-sm text-gray-600">{syncStatus.lastSyncResult.message}</p>
            )}
          </div>
        )}

        {!syncStatus?.enabled && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              To enable automatic match result updates:
            </p>
            <ol className="text-sm text-gray-600 list-decimal list-inside mt-2 space-y-1">
              <li>Get a free API key from <a href="https://www.football-data.org/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">football-data.org</a></li>
              <li>Set the environment variable: <code className="bg-gray-100 px-1 rounded">FOOTBALL_DATA_API_KEY=your_key</code></li>
              <li>Set <code className="bg-gray-100 px-1 rounded">FOOTBALL_DATA_ENABLED=true</code></li>
              <li>Restart the backend server</li>
            </ol>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">Testing Instructions</h3>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>Set a match date to the past (e.g., -2h ago) to lock predictions for that match</li>
          <li>Enter a result to trigger scoring - predictions will be calculated automatically</li>
          <li>Check the leaderboard to see updated points</li>
          <li>Use "Reset" to clear a match result and re-test</li>
        </ol>
      </div>

      {filter === 'verify' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          Compare each finished match against the external scoring service. Click
          "Check result" to fetch what the service reports, then adjust the score if
          needed and press "Set" to update the result and recalculate points.
        </div>
      )}

      <div className="space-y-4">
        {filteredMatches.map(match => (
          filter === 'verify' ? (
            <VerifyResultCard
              key={match.id}
              match={match}
              loading={actionLoading === match.id}
              onCheck={() => adminApi.checkMatchResult(match.id)}
              onSet={(home, away, extra) => handleSetResult(match.id, home, away, extra)}
            />
          ) : (
            <MatchAdminCard
              key={match.id}
              match={match}
              teams={teams}
              allMatches={matches}
              thirdPlaceTeams={thirdPlaceTeams}
              loading={actionLoading === match.id}
              onSetDate={(hours) => handleSetMatchDate(match.id, hours)}
              onSetResult={(home, away, extra) => handleSetResult(match.id, home, away, extra)}
              onSetTeams={(homeTeamId, awayTeamId) => handleSetTeams(match.id, homeTeamId, awayTeamId)}
              onReset={() => handleResetMatch(match.id)}
            />
          )
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No matches found
        </div>
      )}
    </div>
  );
}

/**
 * Teams that could legitimately fill a knockout slot, based on its placeholder:
 * - "1A"/"2B"  -> the 4 teams of that group
 * - "W73"/"L73" -> the two teams currently assigned to match 73
 * - "3rd"       -> the team currently 3rd in each group (which third advances to
 *                  which slot is combination-dependent, but it's always one of the
 *                  current third-placed teams)
 * - anything else -> fall back to any team
 */
function getEligibleTeams(
  placeholder: string | undefined,
  allTeams: Team[],
  allMatches: Match[],
  thirdPlaceTeams: Team[],
): Team[] {
  if (!placeholder) return allTeams;

  const grp = placeholder.match(/^[12]([A-L])$/);
  if (grp) {
    return allTeams.filter(t => t.groupLetter === grp[1]);
  }

  const wl = placeholder.match(/^[WL](\d+)$/i);
  if (wl) {
    const src = allMatches.find(m => m.matchNumber === Number(wl[1]));
    if (!src) return [];
    return [src.homeTeam, src.awayTeam].filter((t): t is Team => !!t);
  }

  if (/^3/.test(placeholder)) {
    return thirdPlaceTeams;
  }

  return allTeams;
}

// Keep the currently assigned team selectable even if it falls outside the
// computed eligible set (avoids the dropdown silently blanking).
function withCurrent(list: Team[], current?: Team): Team[] {
  if (current && !list.some(t => t.id === current.id)) {
    return [current, ...list];
  }
  return list;
}

interface MatchAdminCardProps {
  match: Match;
  teams: Team[];
  allMatches: Match[];
  thirdPlaceTeams: Team[];
  loading: boolean;
  onSetDate: (hoursFromNow: number) => void;
  onSetResult: (
    homeScore: number,
    awayScore: number,
    extra?: { homePenaltyScore?: number; awayPenaltyScore?: number; winnerTeamId?: number },
  ) => void;
  onSetTeams: (homeTeamId?: number, awayTeamId?: number) => void;
  onReset: () => void;
}

function MatchAdminCard({ match, teams, allMatches, thirdPlaceTeams, loading, onSetDate, onSetResult, onSetTeams, onReset }: MatchAdminCardProps) {
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() || '');
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() || '');
  const [homePenalty, setHomePenalty] = useState(match.homePenaltyScore?.toString() || '');
  const [awayPenalty, setAwayPenalty] = useState(match.awayPenaltyScore?.toString() || '');
  const [winnerTeamId, setWinnerTeamId] = useState(match.winnerTeam?.id?.toString() || '');
  const [homeTeamId, setHomeTeamId] = useState(match.homeTeam?.id?.toString() || '');
  const [awayTeamId, setAwayTeamId] = useState(match.awayTeam?.id?.toString() || '');

  const isFinished = match.status === 'FINISHED';
  const isPast = new Date(match.matchDate) < new Date();
  const teamsConfirmed = match.teamsConfirmed;
  const isKnockout = match.stage !== 'GROUP';
  const isDraw =
    homeScore !== '' && awayScore !== '' && parseInt(homeScore) === parseInt(awayScore);
  // A drawn knockout needs a decider: either decisive penalties or an explicit pick.
  const penaltiesDecisive =
    homePenalty !== '' && awayPenalty !== '' && parseInt(homePenalty) !== parseInt(awayPenalty);
  const knockoutNeedsWinner = isKnockout && isDraw && winnerTeamId === '' && !penaltiesDecisive;

  const submitResult = () => {
    const extra = isKnockout
      ? {
          homePenaltyScore: homePenalty !== '' ? parseInt(homePenalty) : undefined,
          awayPenaltyScore: awayPenalty !== '' ? parseInt(awayPenalty) : undefined,
          winnerTeamId: winnerTeamId !== '' ? Number(winnerTeamId) : undefined,
        }
      : undefined;
    onSetResult(parseInt(homeScore) || 0, parseInt(awayScore) || 0, extra);
  };
  const eligibleHome = withCurrent(getEligibleTeams(match.homePlaceholder, teams, allMatches, thirdPlaceTeams), match.homeTeam);
  const eligibleAway = withCurrent(getEligibleTeams(match.awayPlaceholder, teams, allMatches, thirdPlaceTeams), match.awayTeam);

  return (
    <div className={clsx(
      'card border-l-4',
      isFinished ? 'border-l-green-500' : isPast ? 'border-l-yellow-500' : 'border-l-blue-500'
    )}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Match Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={clsx(
              'badge',
              isFinished ? 'badge-success bg-green-100 text-green-800' : 'badge-info'
            )}>
              {match.status}
            </span>
            <span className="badge badge-secondary bg-gray-100 text-gray-700">
              {match.stage} {match.groupLetter && `- Group ${match.groupLetter}`}
            </span>
            <span className="text-sm text-gray-500">#{match.matchNumber}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={clsx('font-bold text-lg', !match.homeTeam && 'text-gray-400')}>
                {match.homeTeam?.code || match.homePlaceholder || 'TBD'}
              </span>
              {isFinished && <span className="text-xl font-bold">{match.homeScore}</span>}
            </div>
            <span className="text-gray-400">vs</span>
            <div className="flex items-center gap-2">
              {isFinished && <span className="text-xl font-bold">{match.awayScore}</span>}
              <span className={clsx('font-bold text-lg', !match.awayTeam && 'text-gray-400')}>
                {match.awayTeam?.code || match.awayPlaceholder || 'TBD'}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-500 mt-1">
            <Calendar className="h-4 w-4 inline mr-1" />
            {new Date(match.matchDate).toLocaleString()}
            {isPast && !isFinished && (
              <span className="ml-2 text-yellow-600 font-medium">(locked - awaiting result)</span>
            )}
          </div>
        </div>

        {/* Date Controls */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-500 font-medium">Set Match Date:</span>
          <div className="flex gap-1">
            {[
              { label: '-2h', hours: -2 },
              { label: '-1h', hours: -1 },
              { label: '+1h', hours: 1 },
              { label: '+24h', hours: 24 },
            ].map(({ label, hours }) => (
              <button
                key={label}
                onClick={() => onSetDate(hours)}
                disabled={loading}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              >
                <Clock className="h-3 w-3 inline mr-1" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Result Controls */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-500 font-medium">Set Result:</span>
          {teamsConfirmed ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-12 h-8 text-center border rounded text-sm"
                  placeholder="H"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-12 h-8 text-center border rounded text-sm"
                  placeholder="A"
                />
                <button
                  onClick={submitResult}
                  disabled={loading || !homeScore || !awayScore || knockoutNeedsWinner}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  Set
                </button>
              </div>

              {/* Knockout tie-breakers: penalty score and the advancing team. */}
              {isKnockout && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-10">Pens</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={homePenalty}
                      onChange={(e) => setHomePenalty(e.target.value)}
                      className="w-12 h-8 text-center border rounded text-sm"
                      placeholder="H"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={awayPenalty}
                      onChange={(e) => setAwayPenalty(e.target.value)}
                      className="w-12 h-8 text-center border rounded text-sm"
                      placeholder="A"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-10">Adv.</span>
                    <select
                      value={winnerTeamId}
                      onChange={(e) => setWinnerTeamId(e.target.value)}
                      className="h-8 border rounded text-sm px-2"
                    >
                      <option value="">Auto (from score)</option>
                      {match.homeTeam && (
                        <option value={match.homeTeam.id}>{match.homeTeam.code}</option>
                      )}
                      {match.awayTeam && (
                        <option value={match.awayTeam.id}>{match.awayTeam.code}</option>
                      )}
                    </select>
                  </div>
                  {knockoutNeedsWinner && (
                    <span className="text-xs text-yellow-600">
                      Draw — set penalties or pick who advances
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Teams not confirmed</span>
          )}
        </div>

        {/* Reset */}
        {isFinished && (
          <button
            onClick={onReset}
            disabled={loading}
            className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:opacity-50 flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </button>
        )}
      </div>

      {/* Knockout team assignment — resolve bracket placeholders to real teams */}
      {isKnockout && !isFinished && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 mb-1">
                Home Team{match.homePlaceholder && <span className="text-gray-400"> ({match.homePlaceholder})</span>}
              </label>
              <select
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                disabled={eligibleHome.length === 0}
                className="h-9 border rounded text-sm px-2 min-w-[12rem] disabled:bg-gray-100"
              >
                <option value="">— Select team —</option>
                {eligibleHome.map(t => (
                  <option key={t.id} value={t.id}>{t.code} — {t.name}</option>
                ))}
              </select>
              {eligibleHome.length === 0 && (
                <span className="text-xs text-yellow-600 mt-1">
                  Resolve match #{match.homePlaceholder?.replace(/^[WL]/i, '')} first
                </span>
              )}
            </div>
            <span className="pb-2 text-gray-400">vs</span>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-500 mb-1">
                Away Team{match.awayPlaceholder && <span className="text-gray-400"> ({match.awayPlaceholder})</span>}
              </label>
              <select
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                disabled={eligibleAway.length === 0}
                className="h-9 border rounded text-sm px-2 min-w-[12rem] disabled:bg-gray-100"
              >
                <option value="">— Select team —</option>
                {eligibleAway.map(t => (
                  <option key={t.id} value={t.id}>{t.code} — {t.name}</option>
                ))}
              </select>
              {eligibleAway.length === 0 && (
                <span className="text-xs text-yellow-600 mt-1">
                  Resolve match #{match.awayPlaceholder?.replace(/^[WL]/i, '')} first
                </span>
              )}
            </div>
            <button
              onClick={() => onSetTeams(
                homeTeamId ? Number(homeTeamId) : undefined,
                awayTeamId ? Number(awayTeamId) : undefined,
              )}
              disabled={loading || (!homeTeamId && !awayTeamId)}
              className="h-9 px-3 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50 flex items-center"
            >
              <Check className="h-4 w-4 mr-1" />
              Set Teams
            </button>
            {!teamsConfirmed && (
              <span className="pb-2 text-xs text-yellow-600">Teams not yet assigned</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface VerifyResultCardProps {
  match: Match;
  loading: boolean;
  onCheck: () => Promise<CheckResultResponse>;
  onSet: (
    homeScore: number,
    awayScore: number,
    extra?: { homePenaltyScore?: number; awayPenaltyScore?: number; winnerTeamId?: number },
  ) => void;
}

/**
 * Compares one finished match against the external scoring service. The admin
 * clicks "Check result" to fetch what the service reports; the score boxes are
 * then revealed (pre-filled with the service value, or the current DB value if
 * the service has nothing) and editable, so a wrong upstream score can be
 * corrected before pressing "Set".
 */
function VerifyResultCard({ match, loading, onCheck, onSet }: VerifyResultCardProps) {
  const isKnockout = match.stage !== 'GROUP';
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<CheckResultResponse | null>(null);

  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [homePenalty, setHomePenalty] = useState('');
  const [awayPenalty, setAwayPenalty] = useState('');
  const [winnerTeamId, setWinnerTeamId] = useState('');

  const handleCheck = async () => {
    setChecking(true);
    try {
      const res = await onCheck();
      setResult(res);
      // Pre-fill from the service result when present, otherwise the current DB value.
      const h = res.found && res.homeScore != null ? res.homeScore : match.homeScore;
      const a = res.found && res.awayScore != null ? res.awayScore : match.awayScore;
      setHomeScore(h != null ? h.toString() : '');
      setAwayScore(a != null ? a.toString() : '');
      setHomePenalty(
        res.homePenaltyScore != null ? res.homePenaltyScore.toString()
          : match.homePenaltyScore != null ? match.homePenaltyScore.toString() : '');
      setAwayPenalty(
        res.awayPenaltyScore != null ? res.awayPenaltyScore.toString()
          : match.awayPenaltyScore != null ? match.awayPenaltyScore.toString() : '');
      setWinnerTeamId(
        res.winnerTeamId != null ? res.winnerTeamId.toString()
          : match.winnerTeam?.id != null ? match.winnerTeam.id.toString() : '');
      setChecked(true);
    } catch {
      setResult({ found: false, message: 'Failed to reach the external service' });
      setChecked(true);
    } finally {
      setChecking(false);
    }
  };

  const isDraw =
    homeScore !== '' && awayScore !== '' && parseInt(homeScore) === parseInt(awayScore);
  const penaltiesDecisive =
    homePenalty !== '' && awayPenalty !== '' && parseInt(homePenalty) !== parseInt(awayPenalty);
  const knockoutNeedsWinner = isKnockout && isDraw && winnerTeamId === '' && !penaltiesDecisive;

  const submit = () => {
    const extra = isKnockout
      ? {
          homePenaltyScore: homePenalty !== '' ? parseInt(homePenalty) : undefined,
          awayPenaltyScore: awayPenalty !== '' ? parseInt(awayPenalty) : undefined,
          winnerTeamId: winnerTeamId !== '' ? Number(winnerTeamId) : undefined,
        }
      : undefined;
    onSet(parseInt(homeScore) || 0, parseInt(awayScore) || 0, extra);
  };

  const dbScore =
    match.homeScore != null && match.awayScore != null
      ? `${match.homeScore} - ${match.awayScore}`
      : '—';
  const serviceScore =
    result?.found && result.homeScore != null && result.awayScore != null
      ? `${result.homeScore} - ${result.awayScore}`
      : null;
  const mismatch =
    serviceScore != null &&
    (result!.homeScore !== match.homeScore || result!.awayScore !== match.awayScore);

  return (
    <div className="card border-l-4 border-l-green-500">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-secondary bg-gray-100 text-gray-700">
              {match.stage}{match.groupLetter && ` - Group ${match.groupLetter}`}
            </span>
            <span className="text-sm text-gray-500">#{match.matchNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg">{match.homeTeam?.code || 'TBD'}</span>
            <span className="text-gray-400">vs</span>
            <span className="font-bold text-lg">{match.awayTeam?.code || 'TBD'}</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Current (DB): <span className="font-semibold">{dbScore}</span>
            {match.homePenaltyScore != null && match.awayPenaltyScore != null && (
              <span className="text-gray-500"> (pens {match.homePenaltyScore}-{match.awayPenaltyScore})</span>
            )}
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={checking || loading}
          className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50 flex items-center self-start"
        >
          <Search className={clsx('h-4 w-4 mr-1', checking && 'animate-pulse')} />
          {checking ? 'Checking...' : 'Check result'}
        </button>
      </div>

      {checked && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {result?.found ? (
            <div className="text-sm">
              Service reports: <span className="font-semibold">{serviceScore}</span>
              {result.homePenaltyScore != null && result.awayPenaltyScore != null && (
                <span className="text-gray-500"> (pens {result.homePenaltyScore}-{result.awayPenaltyScore})</span>
              )}
              {mismatch ? (
                <span className="ml-2 text-yellow-700 font-medium">differs from DB</span>
              ) : (
                <span className="ml-2 text-green-700 font-medium">matches DB</span>
              )}
            </div>
          ) : (
            <div className="text-sm text-yellow-700">
              {result?.message || 'No result returned by the service.'} You can still set the score manually below.
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-14">Final</span>
              <input
                type="number" min="0" max="20" value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="w-12 h-8 text-center border rounded text-sm" placeholder="H"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number" min="0" max="20" value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="w-12 h-8 text-center border rounded text-sm" placeholder="A"
              />
            </div>

            {isKnockout && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-10">Pens</span>
                  <input
                    type="number" min="0" max="20" value={homePenalty}
                    onChange={(e) => setHomePenalty(e.target.value)}
                    className="w-12 h-8 text-center border rounded text-sm" placeholder="H"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number" min="0" max="20" value={awayPenalty}
                    onChange={(e) => setAwayPenalty(e.target.value)}
                    className="w-12 h-8 text-center border rounded text-sm" placeholder="A"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-10">Adv.</span>
                  <select
                    value={winnerTeamId}
                    onChange={(e) => setWinnerTeamId(e.target.value)}
                    className="h-8 border rounded text-sm px-2"
                  >
                    <option value="">Auto (from score)</option>
                    {match.homeTeam && <option value={match.homeTeam.id}>{match.homeTeam.code}</option>}
                    {match.awayTeam && <option value={match.awayTeam.id}>{match.awayTeam.code}</option>}
                  </select>
                </div>
              </>
            )}

            <button
              onClick={submit}
              disabled={loading || homeScore === '' || awayScore === '' || knockoutNeedsWinner}
              className="h-8 px-3 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              <Check className="h-4 w-4 mr-1" />
              Set
            </button>
          </div>

          {knockoutNeedsWinner && (
            <span className="text-xs text-yellow-600">Draw — set penalties or pick who advances</span>
          )}
        </div>
      )}
    </div>
  );
}
