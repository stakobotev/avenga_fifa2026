import axios from 'axios';
import { isDevMode } from '../config/devAuth';
import { useAuthStore } from '../store/authStore';
import type {
  User,
  Team,
  Match,
  Prediction,
  BonusPrediction,
  League,
  LeaderboardEntry,
  PredictionRequest,
  BonusPredictionRequest,
  LeagueRequest,
  StatisticsOverview
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: isDevMode(), // Send session cookies in dev mode
});

// Request interceptor to add Azure AD token (only in production mode)
api.interceptors.request.use(async (config) => {
  // Skip MSAL token acquisition in dev mode - uses session cookies instead
  if (isDevMode()) {
    return config;
  }

  // Production mode: use MSAL for Azure AD tokens
  const { msalInstance, loginRequest } = await import('../config/authConfig');
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    try {
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      // Use ID token for our backend (has correct audience)
      // Access token audience is graph.microsoft.com when using Graph scopes
      config.headers.Authorization = `Bearer ${response.idToken}`;
    } catch (error) {
      console.error('Failed to acquire token silently:', error);
      // Token acquisition failed - redirect to login will happen via MSAL
    }
  }
  return config;
});

// Ensures only ONE session-recovery action runs per page load, even when several
// requests 401 at once (e.g. the dashboard's parallel calls).
let recoveringSession = false;
const REAUTH_GUARD_KEY = 'session_reauth_at';

/**
 * A 401 means the server no longer considers us authenticated (expired session /
 * Azure AD token). Reconcile the client: drop the stale identity so the UI can't
 * keep showing a half-broken "logged in but empty" shell, then recover.
 */
async function handleSessionExpired() {
  if (recoveringSession) return;
  recoveringSession = true;

  // Clear the persisted user so a page reload can't rehydrate a dead session.
  useAuthStore.getState().clearUser();

  // Dev mode: session cookie expired — send the user to the login screen.
  if (isDevMode()) {
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    return;
  }

  // Prod mode: Azure AD token expired and silent refresh failed. Re-authenticate
  // interactively; with a live SSO session this is seamless and MSAL returns the
  // user to the page they were on.
  try {
    const { msalInstance, loginRequest } = await import('../config/authConfig');
    const account = msalInstance.getAllAccounts()[0];

    // Loop guard: if we *just* tried to recover and still got a 401, a plain
    // re-auth isn't working — fall back to a full logout so they get a clean
    // sign-in instead of bouncing forever.
    const lastAttempt = Number(sessionStorage.getItem(REAUTH_GUARD_KEY) || 0);
    if (lastAttempt && Date.now() - lastAttempt < 15000) {
      await msalInstance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
      return;
    }
    sessionStorage.setItem(REAUTH_GUARD_KEY, String(Date.now()));

    if (account) {
      await msalInstance.acquireTokenRedirect({ ...loginRequest, account });
    } else {
      await msalInstance.loginRedirect(loginRequest);
    }
  } catch (error) {
    console.error('Session recovery failed:', error);
    recoveringSession = false; // allow another attempt on the next 401
  }
}

api.interceptors.response.use(
  (response) => {
    // A successful authenticated call means any prior recovery worked — reset the guard.
    sessionStorage.removeItem(REAUTH_GUARD_KEY);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      handleSessionExpired();
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// Users
export const userApi = {
  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get('/users/me');
    return data;
  },
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const { data } = await api.put('/users/me', updates);
    return data;
  },
};

// Teams
export const teamApi = {
  getAll: async (): Promise<Team[]> => {
    const { data } = await api.get('/teams');
    return data;
  },
  getById: async (id: number): Promise<Team> => {
    const { data } = await api.get(`/teams/${id}`);
    return data;
  },
  getByGroup: async (groupLetter: string): Promise<Team[]> => {
    const { data } = await api.get(`/teams/group/${groupLetter}`);
    return data;
  },
  getGrouped: async (): Promise<Record<string, Team[]>> => {
    const { data } = await api.get('/teams/grouped');
    return data;
  },
};

// Matches
export const matchApi = {
  getAll: async (): Promise<Match[]> => {
    const { data } = await api.get('/matches');
    return data;
  },
  getById: async (id: number): Promise<Match> => {
    const { data } = await api.get(`/matches/${id}`);
    return data;
  },
  getByStage: async (stage: string): Promise<Match[]> => {
    const { data } = await api.get(`/matches/stage/${stage}`);
    return data;
  },
  getByGroup: async (groupLetter: string): Promise<Match[]> => {
    const { data } = await api.get(`/matches/group/${groupLetter}`);
    return data;
  },
  getUpcoming: async (): Promise<Match[]> => {
    const { data } = await api.get('/matches/upcoming');
    return data;
  },
  getTopScorers: async (limit = 10): Promise<TopScorer[]> => {
    const { data } = await api.get('/matches/scorers', { params: { limit } });
    return data;
  },
  getToday: async (): Promise<Match[]> => {
    const { data } = await api.get('/matches/today');
    return data;
  },
  getGrouped: async (): Promise<Record<string, Match[]>> => {
    const { data } = await api.get('/matches/grouped');
    return data;
  },
};

// Predictions
export const predictionApi = {
  create: async (prediction: PredictionRequest): Promise<Prediction> => {
    const { data } = await api.post('/predictions', prediction);
    return data;
  },
  getMyPredictions: async (): Promise<Prediction[]> => {
    const { data } = await api.get('/predictions');
    return data;
  },
  getForMatch: async (matchId: number): Promise<Prediction | null> => {
    try {
      const { data } = await api.get(`/predictions/match/${matchId}`);
      return data;
    } catch {
      return null;
    }
  },
  createBonus: async (prediction: BonusPredictionRequest): Promise<BonusPrediction> => {
    const { data } = await api.post('/predictions/bonus', prediction);
    return data;
  },
  getMyBonusPredictions: async (): Promise<BonusPrediction[]> => {
    const { data } = await api.get('/predictions/bonus');
    return data;
  },
};

// Leagues
export const leagueApi = {
  create: async (league: LeagueRequest): Promise<League> => {
    const { data } = await api.post('/leagues', league);
    return data;
  },
  getById: async (id: number): Promise<League> => {
    const { data } = await api.get(`/leagues/${id}`);
    return data;
  },
  getByInviteCode: async (inviteCode: string): Promise<League> => {
    const { data } = await api.get(`/leagues/invite/${inviteCode}`);
    return data;
  },
  getMyLeagues: async (): Promise<League[]> => {
    const { data } = await api.get('/leagues/my');
    return data;
  },
  join: async (inviteCode: string): Promise<League> => {
    const { data } = await api.post(`/leagues/join/${inviteCode}`);
    return data;
  },
  leave: async (id: number): Promise<void> => {
    await api.delete(`/leagues/${id}/leave`);
  },
  getLeaderboard: async (id: number): Promise<LeaderboardEntry[]> => {
    const { data } = await api.get(`/leagues/${id}/leaderboard`);
    return data;
  },
  getMembers: async (id: number): Promise<User[]> => {
    const { data } = await api.get(`/leagues/${id}/members`);
    return data;
  },
};

// Leaderboard
export const leaderboardApi = {
  getGlobal: async (): Promise<LeaderboardEntry[]> => {
    const { data } = await api.get('/leaderboard');
    return data;
  },
  getByRegion: async (region: string): Promise<LeaderboardEntry[]> => {
    const { data } = await api.get(`/leaderboard/region/${region}`);
    return data;
  },
  getRegions: async (): Promise<string[]> => {
    const { data } = await api.get('/leaderboard/regions');
    return data;
  },
  getMyStats: async (): Promise<LeaderboardEntry> => {
    const { data } = await api.get('/leaderboard/me');
    return data;
  },
};

// Statistics (predictions overview, scoped to finished matches)
export const statisticsApi = {
  getOverview: async (): Promise<StatisticsOverview> => {
    const { data } = await api.get('/statistics/overview');
    return data;
  },
};

// Sync status types
export interface SyncResult {
  processed: number;
  updated: number;
  errors: number;
  message: string;
  lastSync: string;
}

export interface SyncStatus {
  enabled: boolean;
  lastSyncResult: SyncResult | null;
  lastSyncAttempt: string | null;
}

// Result the external scoring service currently reports for a match,
// aligned to our home/away orientation (nothing is persisted).
export interface CheckResultResponse {
  found: boolean;
  status?: string;
  homeScore?: number;
  awayScore?: number;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
  winnerTeamId?: number;
  message?: string;
}

// An entry in the external service's top-scorers ranking.
export interface TopScorer {
  playerName: string;
  nationality?: string;
  teamName?: string;
  teamCode?: string;
  goals?: number;
  playedMatches?: number;
}

// Outcome of settling the TOP_SCORER bonus against a chosen player name.
export interface TopScorerAwardResult {
  playerName: string;
  matched: number;
  total: number;
  pointsEach: number;
}

// Outcome of settling a team-based bonus (champion/runner-up/third place).
export interface BonusAwardResult {
  predictionType: string;
  awardedLabel: string;
  matched: number;
  total: number;
  pointsEach: number;
}

// Admin
export const adminApi = {
  updateMatchResult: async (matchId: number, result: {
    homeScore: number;
    awayScore: number;
    homePenaltyScore?: number;
    awayPenaltyScore?: number;
    winnerTeamId?: number;
  }): Promise<Match> => {
    const { data } = await api.put(`/matches/${matchId}/result`, result);
    return data;
  },
  checkMatchResult: async (matchId: number): Promise<CheckResultResponse> => {
    const { data } = await api.get(`/matches/${matchId}/check-result`);
    return data;
  },
  updateMatchDate: async (matchId: number, matchDate: string): Promise<Match> => {
    const { data } = await api.put(`/matches/${matchId}/date`, { matchDate });
    return data;
  },
  updateMatchTeams: async (matchId: number, teams: {
    homeTeamId?: number;
    awayTeamId?: number;
  }): Promise<Match> => {
    const { data } = await api.put(`/matches/${matchId}/teams`, teams);
    return data;
  },
  resetMatch: async (matchId: number): Promise<Match> => {
    const { data } = await api.post(`/matches/${matchId}/reset`);
    return data;
  },
  getSyncStatus: async (): Promise<SyncStatus> => {
    const { data } = await api.get('/matches/sync/status');
    return data;
  },
  triggerSync: async (): Promise<SyncResult> => {
    const { data } = await api.post('/matches/sync/trigger');
    return data;
  },
  awardTopScorer: async (playerName: string): Promise<TopScorerAwardResult> => {
    const { data } = await api.post('/predictions/bonus/award-top-scorer', { playerName });
    return data;
  },
  awardTeamBonus: async (predictionType: string, teamId: number): Promise<BonusAwardResult> => {
    const { data } = await api.post('/predictions/bonus/award-team', {
      predictionType,
      teamId: String(teamId),
    });
    return data;
  },
};

export default api;
