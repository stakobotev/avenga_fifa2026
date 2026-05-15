import { useEffect, useState } from 'react';
import { matchApi, predictionApi } from '../services/api';
import type { Match, Prediction } from '../types';
import MatchCard from '../components/MatchCard';
import GroupStandings from '../components/GroupStandings';
import clsx from 'clsx';

type View = 'all' | 'group' | 'knockout';
type GroupFilter = 'all' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Map<number, Prediction>>(new Map());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('all');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [showStandings, setShowStandings] = useState(false);

  const fetchData = async () => {
    try {
      const [matchesData, predictionsData] = await Promise.all([
        matchApi.getAll(),
        predictionApi.getMyPredictions(),
      ]);

      setMatches(matchesData);
      setPredictions(new Map(predictionsData.map(p => [p.matchId, p])));
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMatches = matches.filter(match => {
    if (view === 'group' && match.stage !== 'GROUP') return false;
    if (view === 'knockout' && match.stage === 'GROUP') return false;
    if (view === 'group' && groupFilter !== 'all' && match.groupLetter !== groupFilter) return false;
    return true;
  });

  const groups: GroupFilter[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="flex space-x-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Match Predictions</h1>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('all')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-all',
              view === 'all'
                ? 'bg-avenga-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All
          </button>
          <button
            onClick={() => { setView('group'); setGroupFilter('all'); }}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-all',
              view === 'group'
                ? 'bg-avenga-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Groups
          </button>
          <button
            onClick={() => setView('knockout')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-all',
              view === 'knockout'
                ? 'bg-avenga-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Knockout
          </button>
        </div>
      </div>

      {/* Group Filter */}
      {view === 'group' && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Filter by group:</span>
          <button
            onClick={() => setGroupFilter('all')}
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium transition-all',
              groupFilter === 'all'
                ? 'bg-avenga-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All
          </button>
          {groups.map(group => (
            <button
              key={group}
              onClick={() => setGroupFilter(group)}
              className={clsx(
                'px-3 py-1 rounded-full text-sm font-medium transition-all',
                groupFilter === group
                  ? 'bg-avenga-red text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Group {group}
            </button>
          ))}
          <button
            onClick={() => setShowStandings(!showStandings)}
            className="ml-auto px-4 py-1 text-sm text-avenga-red hover:text-primary-700"
          >
            {showStandings ? 'Hide Standings' : 'Show Standings'}
          </button>
        </div>
      )}

      {/* Standings */}
      {view === 'group' && showStandings && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(groupFilter === 'all' ? groups : [groupFilter]).map(group => (
            <div key={group} className="card">
              <GroupStandings groupLetter={group} />
            </div>
          ))}
        </div>
      )}

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            prediction={predictions.get(match.id)}
            onPredictionSaved={fetchData}
          />
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No matches found for the selected filter
        </div>
      )}
    </div>
  );
}
