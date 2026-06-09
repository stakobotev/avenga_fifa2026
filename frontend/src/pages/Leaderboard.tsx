import { useEffect, useState } from 'react';
import { Trophy, RefreshCw, Globe, MapPin } from 'lucide-react';
import { leaderboardApi } from '../services/api';
import type { LeaderboardEntry } from '../types';
import { REGION_DISPLAY_NAMES } from '../types';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';

const REGIONS = ['BG_EG', 'CZ_SK', 'PL_MY', 'SEE', 'UA', 'LATAM', 'OTHER'];

export default function Leaderboard() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null); // null = Overall

  const fetchLeaderboard = async (region: string | null, showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);

    try {
      let data: LeaderboardEntry[];
      if (region) {
        data = await leaderboardApi.getByRegion(region);
      } else {
        data = await leaderboardApi.getGlobal();
      }
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(selectedRegion);
  }, [selectedRegion]);

  const handleRegionChange = (region: string | null) => {
    setLoading(true);
    setSelectedRegion(region);
  };

  const handleRefresh = () => {
    fetchLeaderboard(selectedRegion, true);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
            <div key={i} className="h-10 bg-gray-200 rounded w-20"></div>
          ))}
        </div>
        <div className="card">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Region Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleRegionChange(null)}
          className={clsx(
            'px-4 py-2 rounded-lg font-medium transition-all flex items-center',
            selectedRegion === null
              ? 'bg-avenga-red text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <Globe className="h-4 w-4 mr-2" />
          Overall
        </button>
        {REGIONS.map(region => (
          <button
            key={region}
            onClick={() => handleRegionChange(region)}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-all flex items-center',
              selectedRegion === region
                ? 'bg-avenga-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {REGION_DISPLAY_NAMES[region]}
          </button>
        ))}
      </div>

      {/* Top 3 Podium - only show if we have at least 3 entries */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Second Place */}
          <div className="card bg-gradient-to-br from-gray-100 to-gray-200 text-center pt-8 mt-8">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              {entries[1].user.displayName?.charAt(0) || entries[1].user.username.charAt(0)}
            </div>
            <p className="font-bold text-gray-800">{entries[1].user.displayName || entries[1].user.username}</p>
            <p className="text-xs text-gray-500 mb-2">{entries[1].user.regionDisplayName || REGION_DISPLAY_NAMES[entries[1].user.region || 'OTHER']}</p>
            <p className="text-3xl font-bold text-gray-700 my-2">{entries[1].totalPoints}</p>
            <p className="text-sm text-gray-500">points</p>
            <div className="text-4xl mt-4">🥈</div>
          </div>

          {/* First Place */}
          <div className="card bg-gradient-to-br from-yellow-100 to-yellow-200 text-center transform -translate-y-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {entries[0].user.displayName?.charAt(0) || entries[0].user.username.charAt(0)}
            </div>
            <p className="font-bold text-gray-800 text-lg">{entries[0].user.displayName || entries[0].user.username}</p>
            <p className="text-xs text-gray-500 mb-2">{entries[0].user.regionDisplayName || REGION_DISPLAY_NAMES[entries[0].user.region || 'OTHER']}</p>
            <p className="text-4xl font-bold text-yellow-700 my-2">{entries[0].totalPoints}</p>
            <p className="text-sm text-gray-500">points</p>
            <div className="text-5xl mt-4">🥇</div>
          </div>

          {/* Third Place */}
          <div className="card bg-gradient-to-br from-amber-100 to-amber-200 text-center pt-12 mt-12">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              {entries[2].user.displayName?.charAt(0) || entries[2].user.username.charAt(0)}
            </div>
            <p className="font-bold text-gray-800">{entries[2].user.displayName || entries[2].user.username}</p>
            <p className="text-xs text-gray-500 mb-2">{entries[2].user.regionDisplayName || REGION_DISPLAY_NAMES[entries[2].user.region || 'OTHER']}</p>
            <p className="text-2xl font-bold text-amber-700 my-2">{entries[2].totalPoints}</p>
            <p className="text-sm text-gray-500">points</p>
            <div className="text-3xl mt-4">🥉</div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table - Show ALL participants */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Player</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Region</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Points</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Exact</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Correct</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Predictions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const isCurrentUser = user?.id === entry.user.id;
                return (
                  <tr
                    key={entry.user.id}
                    className={clsx(
                      'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                      isCurrentUser && 'bg-purple-50 hover:bg-purple-100'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        entry.rank === 1 && 'bg-yellow-100 text-yellow-700',
                        entry.rank === 2 && 'bg-gray-100 text-gray-700',
                        entry.rank === 3 && 'bg-amber-100 text-amber-700',
                        entry.rank > 3 && 'bg-gray-50 text-gray-600'
                      )}>
                        {entry.rank}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className={clsx(
                          'h-10 w-10 rounded-full flex items-center justify-center text-white font-bold mr-3',
                          isCurrentUser ? 'bg-purple-600' : 'bg-gray-400'
                        )}>
                          {entry.user.displayName?.charAt(0) || entry.user.username.charAt(0)}
                        </div>
                        <div>
                          <p className={clsx(
                            'font-medium',
                            isCurrentUser ? 'text-purple-900' : 'text-gray-900'
                          )}>
                            {entry.user.displayName || entry.user.username}
                            {isCurrentUser && <span className="ml-2 text-xs text-purple-600">(You)</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {entry.user.regionDisplayName || REGION_DISPLAY_NAMES[entry.user.region || 'OTHER']}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-lg text-gray-900">{entry.totalPoints}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-green-600 font-medium">{entry.exactScores}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-blue-600 font-medium">{entry.correctPredictions}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-gray-600">{entry.totalPredictions}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {entries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No participants found {selectedRegion && `in ${REGION_DISPLAY_NAMES[selectedRegion]}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
