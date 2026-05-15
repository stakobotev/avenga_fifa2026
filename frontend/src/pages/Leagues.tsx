import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Copy, Check, UserPlus } from 'lucide-react';
import { leagueApi } from '../services/api';
import type { League } from '../types';

export default function Leagues() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create league form
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeagueDescription, setNewLeagueDescription] = useState('');
  const [newLeaguePrizes, setNewLeaguePrizes] = useState('');
  const [creating, setCreating] = useState(false);

  // Join league form
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const fetchLeagues = async () => {
    try {
      const data = await leagueApi.getMyLeagues();
      setLeagues(data);
    } catch (error) {
      console.error('Failed to fetch leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, []);

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await leagueApi.create({
        name: newLeagueName,
        description: newLeagueDescription,
        prizes: newLeaguePrizes,
        isPrivate: true,
      });
      setShowCreateModal(false);
      setNewLeagueName('');
      setNewLeagueDescription('');
      setNewLeaguePrizes('');
      fetchLeagues();
    } catch (error) {
      console.error('Failed to create league:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoining(true);
    setJoinError('');

    try {
      await leagueApi.join(inviteCode.toUpperCase());
      setShowJoinModal(false);
      setInviteCode('');
      fetchLeagues();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setJoinError(error.response?.data?.message || 'Invalid invite code');
    } finally {
      setJoining(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Leagues</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn btn-secondary flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Join League
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create League
          </button>
        </div>
      </div>

      {leagues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map(league => (
            <Link
              key={league.id}
              to={`/leagues/${league.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-700" />
                </div>
                <span className="badge badge-info">{league.memberCount} members</span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{league.name}</h3>
              {league.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{league.description}</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm">
                  <span className="text-gray-500">Invite code: </span>
                  <span className="font-mono font-medium">{league.inviteCode}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    copyInviteCode(league.inviteCode);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {copiedCode === league.inviteCode ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              {league.prizes && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Prizes: </span>
                    {league.prizes}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leagues yet</h3>
          <p className="text-gray-500 mb-6">Create a league or join one with an invite code</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn btn-secondary"
            >
              Join League
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create League
            </button>
          </div>
        </div>
      )}

      {/* Create League Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New League</h2>
            <form onSubmit={handleCreateLeague} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  League Name *
                </label>
                <input
                  type="text"
                  value={newLeagueName}
                  onChange={(e) => setNewLeagueName(e.target.value)}
                  className="input"
                  placeholder="e.g., Office Champions"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newLeagueDescription}
                  onChange={(e) => setNewLeagueDescription(e.target.value)}
                  className="input min-h-[80px]"
                  placeholder="What's this league about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prizes
                </label>
                <input
                  type="text"
                  value={newLeaguePrizes}
                  onChange={(e) => setNewLeaguePrizes(e.target.value)}
                  className="input"
                  placeholder="e.g., Winner gets a coffee"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary flex-1"
                >
                  {creating ? 'Creating...' : 'Create League'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join League Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Join a League</h2>
            <form onSubmit={handleJoinLeague} className="space-y-4">
              {joinError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {joinError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="input font-mono text-center text-lg tracking-wider"
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinError('');
                    setInviteCode('');
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  className="btn btn-primary flex-1"
                >
                  {joining ? 'Joining...' : 'Join League'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
