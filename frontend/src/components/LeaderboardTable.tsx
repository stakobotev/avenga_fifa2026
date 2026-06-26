import { Trophy, Medal, Award } from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import { useAuthStore } from '../store/authStore';
import AdminUserLink from './AdminUserLink';
import clsx from 'clsx';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  showDetails?: boolean;
}

export default function LeaderboardTable({ entries, showDetails = true }: LeaderboardTableProps) {
  const { user } = useAuthStore();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-gray-500 font-medium">{rank}</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Rank</th>
            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Player</th>
            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">Points</th>
            {showDetails && (
              <>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 hidden md:table-cell">Exact</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 hidden md:table-cell">Correct</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600 hidden lg:table-cell">Predictions</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.user.id}
              className={clsx(
                'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                entry.user.id === user?.id && 'bg-red-50'
              )}
            >
              <td className="py-4 px-4">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(entry.rank)}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold">
                    {entry.user.displayName?.charAt(0).toUpperCase() || entry.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">
                      <AdminUserLink
                        userId={entry.user.id}
                        displayName={entry.user.displayName || entry.user.username}
                      >
                        {entry.user.displayName || entry.user.username}
                      </AdminUserLink>
                      {entry.user.id === user?.id && (
                        <span className="ml-2 text-xs text-avenga-red">(You)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">@{entry.user.username}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <div className="font-bold text-xl text-gray-900">{entry.totalPoints}</div>
                {showDetails && (
                  <div className="text-xs text-gray-500">
                    {entry.matchPoints} match + {entry.bonusPoints} bonus
                  </div>
                )}
              </td>
              {showDetails && (
                <>
                  <td className="py-4 px-4 text-center hidden md:table-cell">
                    <div className="flex items-center justify-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {entry.exactScores}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center hidden md:table-cell">
                    <span className="text-gray-700">{entry.correctPredictions}</span>
                  </td>
                  <td className="py-4 px-4 text-center hidden lg:table-cell">
                    <span className="text-gray-500">{entry.totalPredictions}</span>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {entries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No entries yet. Start predicting to appear on the leaderboard!
        </div>
      )}
    </div>
  );
}
