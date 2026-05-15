import { useState, useEffect } from 'react';
import { User, Trophy, Target, Calendar, Save, MapPin } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { userApi, leaderboardApi, predictionApi } from '../services/api';
import type { LeaderboardEntry, Prediction } from '../types';
import { REGION_DISPLAY_NAMES } from '../types';


export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const region = user?.region || 'OTHER';
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState<LeaderboardEntry | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, predictions] = await Promise.all([
          leaderboardApi.getMyStats(),
          predictionApi.getMyPredictions(),
        ]);
        setStats(statsData);
        setRecentPredictions(predictions.filter(p => p.scored).slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userApi.updateProfile({ displayName });
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = displayName !== user?.displayName;

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="card h-48"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-4xl font-bold">
            {user?.displayName?.charAt(0).toUpperCase() || user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user?.displayName || user?.username}</h1>
            <p className="text-gray-500">@{user?.username}</p>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-gray-500 flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {user?.regionDisplayName || REGION_DISPLAY_NAMES[user?.region || 'OTHER']}
            </p>
          </div>
          {stats && (
            <div className="text-center md:text-right">
              <div className="text-4xl font-bold text-avenga-red">#{stats.rank}</div>
              <p className="text-gray-500">Global Rank</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
              placeholder="Your display name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="h-4 w-4 inline mr-1" />
              Region
            </label>
            <input
              type="text"
              value={REGION_DISPLAY_NAMES[region] || region}
              disabled
              className="input bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Automatically set from your organization profile</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="btn btn-primary flex items-center"
        >
          {saved ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : saving ? (
            'Saving...'
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <Trophy className="h-8 w-8 text-avenga-red mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.totalPoints}</p>
            <p className="text-sm text-gray-500">Total Points</p>
          </div>
          <div className="card text-center">
            <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.exactScores}</p>
            <p className="text-sm text-gray-500">Exact Scores</p>
          </div>
          <div className="card text-center">
            <User className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.correctPredictions}</p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div className="card text-center">
            <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{stats.totalPredictions}</p>
            <p className="text-sm text-gray-500">Predictions</p>
          </div>
        </div>
      )}

      {/* Recent Scored Predictions */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Results</h2>
        {recentPredictions.length > 0 ? (
          <div className="space-y-3">
            {recentPredictions.map(pred => (
              <div
                key={pred.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  pred.pointsEarned === 5
                    ? 'bg-green-50'
                    : pred.pointsEarned && pred.pointsEarned > 0
                    ? 'bg-yellow-50'
                    : 'bg-red-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="font-medium">{pred.match.homeTeam.code}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="font-medium">{pred.match.awayTeam.code}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Your: {pred.predictedHomeScore}-{pred.predictedAwayScore}
                  </span>
                  <span className="text-sm text-gray-500">
                    Actual: {pred.match.homeScore}-{pred.match.awayScore}
                  </span>
                  <span className={`font-bold ${
                    pred.pointsEarned === 5
                      ? 'text-green-600'
                      : pred.pointsEarned && pred.pointsEarned > 0
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    +{pred.pointsEarned}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No scored predictions yet. Your results will appear here after matches are completed.
          </p>
        )}
      </div>
    </div>
  );
}
