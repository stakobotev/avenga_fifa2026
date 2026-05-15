export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  region?: string;
  regionDisplayName?: string;
}

export type Region = 'BG_EG' | 'CZ_SK' | 'UA' | 'SEE' | 'WE' | 'ARG' | 'PL' | 'OTHER';

export const REGION_DISPLAY_NAMES: Record<string, string> = {
  'BG_EG': 'BG & EG',
  'CZ_SK': 'CZ & SK',
  'UA': 'UA',
  'SEE': 'SEE',
  'WE': 'WE',
  'ARG': 'ARG',
  'PL': 'PL',
  'OTHER': 'Other',
};

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  displayName: string;
  role: string;
}

export interface Team {
  id: number;
  name: string;
  code: string;
  flagUrl?: string;
  groupLetter?: string;
  fifaRanking?: number;
  confederation?: string;
}

export interface Match {
  id: number;
  homeTeam?: Team;
  awayTeam?: Team;
  homePlaceholder?: string;
  awayPlaceholder?: string;
  matchDate: string;
  venue: string;
  city: string;
  stage: 'GROUP' | 'ROUND_OF_32' | 'ROUND_OF_16' | 'QUARTERFINAL' | 'SEMIFINAL' | 'THIRD_PLACE' | 'FINAL';
  groupLetter?: string;
  matchNumber: number;
  homeScore?: number;
  awayScore?: number;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  winnerTeam?: Team;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  locked: boolean;
  teamsConfirmed: boolean;
}

export interface Prediction {
  id: number;
  matchId: number;
  match: Match;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedAdvancingTeamId?: number;
  predictedAdvancingTeam?: Team;
  createdAt: string;
  updatedAt?: string;
  pointsEarned?: number;
  scored: boolean;
}

export interface BonusPrediction {
  id: number;
  predictionType: 'CHAMPION' | 'RUNNER_UP' | 'THIRD_PLACE' | 'TOP_SCORER';
  selectedTeam?: Team;
  selectedPlayerName?: string;
  createdAt: string;
  pointsEarned?: number;
  scored: boolean;
}

export interface League {
  id: number;
  name: string;
  description?: string;
  inviteCode: string;
  owner: User;
  memberCount: number;
  createdAt: string;
  isPrivate: boolean;
  prizes?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  totalPoints: number;
  matchPoints: number;
  bonusPoints: number;
  exactScores: number;
  correctPredictions: number;
  totalPredictions: number;
}

export interface PredictionRequest {
  matchId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedAdvancingTeamId?: number;
}

export interface BonusPredictionRequest {
  predictionType: string;
  selectedTeamId?: number;
  selectedPlayerName?: string;
}

export interface LeagueRequest {
  name: string;
  description?: string;
  isPrivate?: boolean;
  prizes?: string;
}
