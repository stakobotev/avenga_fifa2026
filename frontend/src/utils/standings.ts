import type { Team, Match } from '../types';

export interface Standing {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

/**
 * Compute group standings for the given teams from their finished matches,
 * sorted best-first (points, then goal difference, then goals for).
 * Pass a single group's teams and matches.
 */
export function computeGroupStandings(teams: Team[], matches: Match[]): Standing[] {
  const standingsMap = new Map<number, Standing>();

  teams.forEach(team => {
    standingsMap.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  });

  matches
    .filter(m => m.status === 'FINISHED' && m.homeScore != null && m.awayScore != null && m.homeTeam && m.awayTeam)
    .forEach(match => {
      const home = standingsMap.get(match.homeTeam!.id);
      const away = standingsMap.get(match.awayTeam!.id);
      if (!home || !away) return; // a team outside this group set — skip

      home.played++;
      away.played++;
      home.goalsFor += match.homeScore!;
      home.goalsAgainst += match.awayScore!;
      away.goalsFor += match.awayScore!;
      away.goalsAgainst += match.homeScore!;

      if (match.homeScore! > match.awayScore!) {
        home.won++;
        home.points += 3;
        away.lost++;
      } else if (match.homeScore! < match.awayScore!) {
        away.won++;
        away.points += 3;
        home.lost++;
      } else {
        home.drawn++;
        away.drawn++;
        home.points++;
        away.points++;
      }
    });

  return Array.from(standingsMap.values())
    .map(s => ({ ...s, goalDifference: s.goalsFor - s.goalsAgainst }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
}
