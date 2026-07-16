import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Trophy, Calendar, Target, TrendingUp, ChevronRight, Award, MapPin, Crown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { matchApi, predictionApi, leaderboardApi, type TopScorer } from '../services/api';
import type { Match, Prediction, LeaderboardEntry, BonusPrediction } from '../types';
import { REGION_DISPLAY_NAMES } from '../types';
import MatchCard from '../components/MatchCard';

// Map FIFA 3-letter codes to ISO 2-letter codes for flag CDN
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

const getFlagUrl = (code: string): string => {
  const isoCode = FIFA_TO_ISO[code] || code.toLowerCase().slice(0, 2);
  return `https://flagcdn.com/24x18/${isoCode}.png`;
};

// Best possible points from a single unplayed match (exact score).
const MAX_POINTS_PER_MATCH = 5;

interface RaceEntry extends LeaderboardEntry {
  ceiling: number; // best final total if every remaining pick lands perfectly
}

// Given current standings (by match points) and how many matches are still to be
// played, work out — for each user — the HIGHEST podium place they can still
// reach in a best case. A rival is "out of reach above" someone only if the
// rival's current points already exceed that someone's best-possible final.
function computeRace(standings: LeaderboardEntry[], remaining: number) {
  const gain = MAX_POINTS_PER_MATCH * remaining;
  const withCeiling: RaceEntry[] = standings.map(e => ({ ...e, ceiling: e.matchPoints + gain }));

  const first: RaceEntry[] = [];
  const second: RaceEntry[] = [];
  const third: RaceEntry[] = [];

  for (const e of withCeiling) {
    // How many OTHER users are guaranteed to finish above this user's best case?
    const guaranteedAbove = withCeiling.filter(
      o => o.user?.id !== e.user?.id && o.matchPoints > e.ceiling,
    ).length;

    if (guaranteedAbove === 0) first.push(e);        // can still finish 1st
    else if (guaranteedAbove === 1) second.push(e);  // best case is 2nd
    else if (guaranteedAbove === 2) third.push(e);   // best case is 3rd
  }

  const byPotential = (a: RaceEntry, b: RaceEntry) =>
    b.matchPoints - a.matchPoints || b.ceiling - a.ceiling;
  first.sort(byPotential);
  second.sort(byPotential);
  third.sort(byPotential);

  return { first, second, third };
}

// Visual styling per podium place (1 = gold / 2 = silver / 3 = bronze).
const POSITION_META: Record<number, {
  label: string; ring: string; chip: string; text: string;
}> = {
  1: { label: 'Can still win', ring: 'ring-amber-400', chip: 'bg-amber-400 text-amber-950', text: 'text-amber-300' },
  2: { label: 'Can reach 2nd', ring: 'ring-slate-300', chip: 'bg-slate-200 text-slate-800', text: 'text-slate-200' },
  3: { label: 'Can reach 3rd', ring: 'ring-orange-500', chip: 'bg-orange-500 text-orange-950', text: 'text-orange-300' },
};

function RaceColumn({ place, entries }: { place: number; entries: RaceEntry[] }) {
  const m = POSITION_META[place];
  const shown = entries.slice(0, 6);
  const more = entries.length - shown.length;

  return (
    <div className="flex-1 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="mb-3 flex items-center gap-2">
        <span className={clsx('flex h-7 w-7 items-center justify-center rounded-full text-sm font-black', m.chip)}>
          {place}
        </span>
        <h3 className={clsx('text-sm font-bold', m.text)}>{m.label}</h3>
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
          {entries.length}
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-slate-500">Out of reach.</p>
      ) : (
        <ul className="space-y-2">
          {shown.map((e, i) => {
            const name = e.user?.displayName || e.user?.username || '—';
            const region = e.user?.regionDisplayName
              || (e.user?.region ? REGION_DISPLAY_NAMES[e.user.region] : '');
            return (
              <li key={e.user?.id ?? i} className="flex items-center gap-2">
                <div className={clsx(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white ring-2',
                  m.ring,
                )}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white" title={name}>{name}</p>
                  {region && <p className="truncate text-[10px] text-slate-400">{region}</p>}
                </div>
                <span
                  className={clsx('flex-shrink-0 text-xs font-bold', m.text)}
                  title="Best-case final points"
                >
                  ↑{e.ceiling}
                </span>
              </li>
            );
          })}
          {more > 0 && (
            <li className="pt-1 text-[11px] text-slate-500">+{more} more</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Map<number, Prediction>>(new Map());
  const [bonusPredictions, setBonusPredictions] = useState<BonusPrediction[]>([]);
  const [stats, setStats] = useState<LeaderboardEntry | null>(null);
  const [regionalRank, setRegionalRank] = useState<number | null>(null);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [standings, setStandings] = useState<LeaderboardEntry[]>([]);
  const [remainingMatches, setRemainingMatches] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // Run all requests independently — a single failure (e.g. /leaderboard/me) must NOT
    // hide upcoming matches or bonus predictions, which are fetched from separate endpoints.
    const [matchesRes, predictionsRes, bonusRes, statsRes, scorersRes, globalRes, allMatchesRes] = await Promise.allSettled([
      matchApi.getUpcoming(),
      predictionApi.getMyPredictions(),
      predictionApi.getMyBonusPredictions(),
      leaderboardApi.getMyStats(),
      matchApi.getTopScorers(5),
      leaderboardApi.getGlobal(),
      matchApi.getAll(),
    ]);

    if (matchesRes.status === 'fulfilled') {
      setUpcomingMatches(matchesRes.value.slice(0, 6));
    } else {
      console.error('Failed to fetch upcoming matches:', matchesRes.reason);
    }

    if (predictionsRes.status === 'fulfilled') {
      setPredictions(new Map(predictionsRes.value.map(p => [p.matchId, p])));
    } else {
      console.error('Failed to fetch predictions:', predictionsRes.reason);
    }

    if (bonusRes.status === 'fulfilled') {
      setBonusPredictions(bonusRes.value);
    } else {
      console.error('Failed to fetch bonus predictions:', bonusRes.reason);
    }

    if (statsRes.status === 'fulfilled') {
      setStats(statsRes.value);
    } else {
      console.error('Failed to fetch user stats:', statsRes.reason);
    }

    // Top scorers come from the external API; if it fails, leave the list empty
    // so the card simply isn't shown.
    if (scorersRes.status === 'fulfilled') {
      setTopScorers(scorersRes.value);
    } else {
      console.error('Failed to fetch top scorers:', scorersRes.reason);
    }

    // Race for the win: full standings (all regions) + how many matches are still
    // to be played, so we can project who can still reach 1st / 2nd / 3rd.
    if (globalRes.status === 'fulfilled') {
      setStandings(globalRes.value);
    } else {
      console.error('Failed to fetch global leaderboard:', globalRes.reason);
    }

    if (allMatchesRes.status === 'fulfilled') {
      const left = allMatchesRes.value.filter(
        m => m.status !== 'FINISHED' && m.status !== 'CANCELLED',
      ).length;
      setRemainingMatches(left);
    } else {
      console.error('Failed to fetch matches for race projection:', allMatchesRes.reason);
    }

    // Fetch regional rank independently if user has a region
    if (user?.region) {
      try {
        const regionalLeaderboard = await leaderboardApi.getByRegion(user.region);
        const myRegionalEntry = regionalLeaderboard.find(e => e.user?.id === user.id);
        if (myRegionalEntry) {
          setRegionalRank(myRegionalEntry.rank);
        }
      } catch (e) {
        console.error('Failed to fetch regional rank:', e);
      }
    }

    setLoading(false);
  };

  const bonusCount = bonusPredictions.length;
  const totalBonusTypes = 4;

  const race = computeRace(standings, remainingMatches);
  const raceHasContenders = race.first.length + race.second.length + race.third.length > 0;
  const pointsToPlayFor = MAX_POINTS_PER_MATCH * remainingMatches;

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-900 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.displayName || user?.username}!
        </h1>
        <p className="text-purple-200">
          Make your predictions for the FIFA World Cup 2026
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <Trophy className="h-6 w-6 text-avenga-red" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Global Rank</p>
              <p className="text-2xl font-bold">#{stats?.rank || '-'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{user?.region ? REGION_DISPLAY_NAMES[user.region] : 'Region'}</p>
              <p className="text-2xl font-bold">#{regionalRank || '-'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Points</p>
              <p className="text-2xl font-bold">{stats?.totalPoints || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Exact Scores</p>
              <p className="text-2xl font-bold">{stats?.exactScores || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Predictions</p>
              <p className="text-2xl font-bold">{stats?.totalPredictions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Matches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Matches</h2>
            <Link
              to="/matches"
              className="flex items-center text-avenga-red hover:text-primary-700 font-medium"
            >
              View all
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {upcomingMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMatches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictions.get(match.id)}
                  onPredictionSaved={fetchData}
                />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming matches at the moment</p>
            </div>
          )}

          {/* Race for the Win — who can still reach 1st / 2nd / 3rd (all regions,
              match points only) given the points still up for grabs */}
          {remainingMatches > 0 && raceHasContenders && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 text-white shadow-xl ring-1 ring-white/10">
              {/* Ambient glow */}
              <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />

              <div className="relative mb-5 flex items-start justify-between">
                <div>
                  <h2 className="flex items-center text-lg font-bold">
                    <Crown className="mr-2 h-5 w-5 text-amber-400" />
                    Race for the Win
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Best-case finish if every remaining pick lands ·{' '}
                    <span className="font-semibold text-amber-300">
                      {remainingMatches} {remainingMatches === 1 ? 'match' : 'matches'} left
                    </span>{' '}
                    · up to {pointsToPlayFor} pts to play for
                  </p>
                </div>
                <Link
                  to="/leaderboard"
                  className="flex flex-shrink-0 items-center text-xs font-medium text-amber-400 hover:text-amber-300"
                >
                  Full board
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="relative flex flex-col gap-3 sm:flex-row">
                <RaceColumn place={1} entries={race.first} />
                <RaceColumn place={2} entries={race.second} />
                <RaceColumn place={3} entries={race.third} />
              </div>

              <p className="relative mt-3 text-[11px] text-slate-500">
                ↑ shows each player's best possible final total (match points only, bonuses excluded).
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bonus Predictions Summary */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Bonus Predictions</h3>
              <span className="text-sm text-gray-500">{bonusCount}/{totalBonusTypes} done</span>
            </div>
            <div className="flex items-center bg-red-100 text-red-700 rounded-lg px-3 py-2 text-xs font-medium mb-4">
              <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Locked once tournament starts!</span>
            </div>
            <div className="space-y-3 mb-4">
              {['CHAMPION', 'RUNNER_UP', 'THIRD_PLACE', 'TOP_SCORER'].map((type) => {
                const pred = bonusPredictions.find(p => p.predictionType === type);
                const labels: Record<string, string> = {
                  CHAMPION: 'Champion',
                  RUNNER_UP: 'Runner-up',
                  THIRD_PLACE: 'Third Place',
                  TOP_SCORER: 'Top Scorer',
                };
                return (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{labels[type]}</span>
                    {pred ? (
                      <span className="font-medium text-green-600 flex items-center">
                        {pred.selectedTeam?.code && (
                          <img
                            src={getFlagUrl(pred.selectedTeam.code)}
                            alt={pred.selectedTeam.name}
                            className="w-5 h-4 object-contain mr-1.5 rounded shadow-sm"
                          />
                        )}
                        {pred.selectedTeam?.code || pred.selectedPlayerName || '—'}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </div>
                );
              })}
            </div>
            <Link
              to="/bonus"
              className="btn btn-primary w-full flex items-center justify-center"
            >
              <Award className="h-4 w-4 mr-2" />
              {bonusCount < totalBonusTypes ? 'Make Predictions' : 'View Predictions'}
            </Link>
          </div>

          {/* Top Scorers (live from the external API; hidden if unavailable) */}
          {topScorers.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                Top Scorers
              </h3>
              <div className="space-y-3">
                {topScorers.map((s, i) => (
                  <div key={`${s.playerName}-${i}`} className="flex items-center justify-between text-sm">
                    <div className="flex items-center min-w-0">
                      <span className="w-5 text-gray-400 font-medium flex-shrink-0">{i + 1}</span>
                      {s.teamCode && (
                        <img
                          src={getFlagUrl(s.teamCode)}
                          alt={s.teamName || s.teamCode}
                          className="w-5 h-4 object-contain mx-2 rounded shadow-sm flex-shrink-0"
                        />
                      )}
                      <span className="truncate text-gray-700">{s.playerName}</span>
                    </div>
                    <span className="font-bold text-gray-900 ml-2 flex-shrink-0">
                      {s.goals ?? 0}
                      <span className="ml-1 text-xs font-normal text-gray-400">goals</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                to="/matches"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span>All Matches</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                to="/leaderboard"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span>Leaderboard</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
