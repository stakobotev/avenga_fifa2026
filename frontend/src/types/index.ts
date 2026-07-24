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

export type Region = 'BG_EG' | 'CZ_SK' | 'PL_MY' | 'SEE' | 'UA' | 'LATAM' | 'OTHER';

export const REGION_DISPLAY_NAMES: Record<string, string> = {
  'BG_EG': 'BG & EG',
  'CZ_SK': 'CZ & SK',
  'PL_MY': 'PL & MY',
  'SEE': 'SEE',
  'UA': 'UA',
  'LATAM': 'LATAM',
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

// --- Statistics (scoped to finished matches) ---

export interface StatPlayer {
  name: string;
  count: number;
  pct: number;
}

export interface StatTeam {
  code: string;
  name: string;
  flagUrl?: string;
  count: number;
  pct: number;
}

export interface StatRegion {
  region: string;
  regionDisplayName: string;
  usersWithPredictions: number;
  totalPredictions: number;
  exactScore: number;
  onlyWinner: number;
  sharePct: number;
}

export interface StatMatch {
  matchNumber: number;
  stage: string;
  homeTeam?: Team;
  awayTeam?: Team;
  homeScore: number;
  awayScore: number;
  predictions: number;
  exactScore: number;
  exactPct: number;
  correctWinner: number;
  correctWinnerPct: number;
}

export interface BonusWinner {
  name: string;
  code?: string;
  flagUrl?: string;
}

export interface BonusResult {
  type: 'CHAMPION' | 'RUNNER_UP' | 'THIRD_PLACE' | 'TOP_SCORER';
  label: string;
  winners: BonusWinner[];
  correct: number;
  totalPicks: number;
  pct: number;
  pointsEach: number;
  settled: boolean;
}

export interface StatisticsOverview {
  totalUsers: number;
  totalPredictions: number;
  exactScore: number;
  onlyWinner: number;
  topScorers: StatPlayer[];
  champion: StatTeam[];
  runnerUp: StatTeam[];
  thirdPlace: StatTeam[];
  bonusResults: BonusResult[];
  regions: StatRegion[];
  regionsTotal: StatRegion;
  matches: StatMatch[];
}

// Per-match breakdown (admin) of who predicted exact / correct winner.
export interface MatchPredictionUser {
  userId: number;
  displayName?: string;
  username: string;
  region?: string;
  regionDisplayName?: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
}

export interface MatchPredictionBreakdown {
  matchNumber: number;
  stage: string;
  homeTeam?: Team;
  awayTeam?: Team;
  homeScore: number;
  awayScore: number;
  exactScorers: MatchPredictionUser[];
  winnerScorers: MatchPredictionUser[];
}
