import { useState, useEffect } from 'react';
import { teamApi, matchApi } from '../services/api';
import { computeGroupStandings, type Standing } from '../utils/standings';

interface GroupStandingsProps {
  groupLetter: string;
}

export default function GroupStandings({ groupLetter }: GroupStandingsProps) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teams, matches] = await Promise.all([
          teamApi.getByGroup(groupLetter),
          matchApi.getByGroup(groupLetter),
        ]);

        setStandings(computeGroupStandings(teams, matches));
      } catch (error) {
        console.error('Failed to fetch standings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupLetter]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Group {groupLetter}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 px-2 text-left">#</th>
              <th className="py-2 px-2 text-left">Team</th>
              <th className="py-2 px-2 text-center">P</th>
              <th className="py-2 px-2 text-center">W</th>
              <th className="py-2 px-2 text-center">D</th>
              <th className="py-2 px-2 text-center">L</th>
              <th className="py-2 px-2 text-center hidden sm:table-cell">GF</th>
              <th className="py-2 px-2 text-center hidden sm:table-cell">GA</th>
              <th className="py-2 px-2 text-center">GD</th>
              <th className="py-2 px-2 text-center font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr
                key={standing.team.id}
                className={`border-b border-gray-100 ${index < 2 ? 'bg-green-50' : ''}`}
              >
                <td className="py-2 px-2 font-medium">{index + 1}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center">
                    <span className="font-medium">{standing.team.code}</span>
                    <span className="ml-2 text-gray-500 hidden sm:inline">{standing.team.name}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-center">{standing.played}</td>
                <td className="py-2 px-2 text-center">{standing.won}</td>
                <td className="py-2 px-2 text-center">{standing.drawn}</td>
                <td className="py-2 px-2 text-center">{standing.lost}</td>
                <td className="py-2 px-2 text-center hidden sm:table-cell">{standing.goalsFor}</td>
                <td className="py-2 px-2 text-center hidden sm:table-cell">{standing.goalsAgainst}</td>
                <td className="py-2 px-2 text-center">
                  {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                </td>
                <td className="py-2 px-2 text-center font-bold">{standing.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
