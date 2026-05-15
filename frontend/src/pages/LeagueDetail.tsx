import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Trophy, Copy, Check, ArrowLeft, LogOut } from 'lucide-react';
import { leagueApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { League, LeaderboardEntry } from '../types';
import LeaderboardTable from '../components/LeaderboardTable';

export default function LeagueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [league, setLeague] = useState<League | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leagueData, leaderboardData] = await Promise.all([
          leagueApi.getById(parseInt(id!)),
          leagueApi.getLeaderboard(parseInt(id!)),
        ]);
        setLeague(leagueData);
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Failed to fetch league:', error);
        navigate('/leagues');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const copyInviteCode = () => {
    if (league) {
      navigator.clipboard.writeText(league.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeave = async () => {
    if (!league || !window.confirm('Are you sure you want to leave this league?')) return;

    setLeaving(true);
    try {
      await leagueApi.leave(league.id);
      navigate('/leagues');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to leave league');
    } finally {
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="card h-32"></div>
        <div className="card h-64"></div>
      </div>
    );
  }

  if (!league) return null;

  const isOwner = league.owner.id === user?.id;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/leagues')}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Leagues
      </button>

      {/* League Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="p-4 bg-purple-100 rounded-xl mr-4">
              <Trophy className="h-8 w-8 text-purple-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{league.name}</h1>
              {league.description && (
                <p className="text-gray-600 mt-1">{league.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2" />
              <span>{league.memberCount} members</span>
            </div>
            {!isOwner && (
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="btn btn-secondary flex items-center text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave
              </button>
            )}
          </div>
        </div>

        {/* Invite Code */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Invite Code</p>
              <p className="font-mono text-2xl font-bold tracking-wider">{league.inviteCode}</p>
            </div>
            <button
              onClick={copyInviteCode}
              className="btn btn-secondary flex items-center"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Share this code with others to invite them to your league
          </p>
        </div>

        {/* Prizes */}
        {league.prizes && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
            <p className="font-medium text-yellow-800">
              <span className="font-bold">Prizes: </span>
              {league.prizes}
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">League Standings</h2>
        <LeaderboardTable entries={leaderboard} />
      </div>
    </div>
  );
}
