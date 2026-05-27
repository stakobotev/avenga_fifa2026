import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Target, TrendingUp, ChevronRight, Award, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { matchApi, predictionApi, leaderboardApi } from '../services/api';
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

export default function Dashboard() {
  const { user } = useAuthStore();
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Map<number, Prediction>>(new Map());
  const [bonusPredictions, setBonusPredictions] = useState<BonusPrediction[]>([]);
  const [stats, setStats] = useState<LeaderboardEntry | null>(null);
  const [regionalRank, setRegionalRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [matches, userPredictions, bonusPredsData, userStats] = await Promise.all([
        matchApi.getUpcoming(),
        predictionApi.getMyPredictions(),
        predictionApi.getMyBonusPredictions(),
        leaderboardApi.getMyStats(),
      ]);

      setUpcomingMatches(matches.slice(0, 6));
      setPredictions(new Map(userPredictions.map(p => [p.matchId, p])));
      setBonusPredictions(bonusPredsData);
      setStats(userStats);

      // Fetch regional rank if user has a region
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
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const bonusCount = bonusPredictions.length;
  const totalBonusTypes = 4;

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
