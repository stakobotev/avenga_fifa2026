import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useAuthStore } from './store/authStore';
import { authApi } from './services/api';
import { isDevMode, devAuthApi } from './config/devAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Knockout from './pages/Knockout';
import Leaderboard from './pages/Leaderboard';
import Leagues from './pages/Leagues';
import LeagueDetail from './pages/LeagueDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import BonusPredictions from './pages/BonusPredictions';
import MyPredictions from './pages/MyPredictions';
import UserPredictions from './pages/UserPredictions';
import Statistics from './pages/Statistics';
import MatchPredictionStats from './pages/MatchPredictionStats';
import Help from './pages/Help';
import ResultsCountdown from './pages/ResultsCountdown';
import RevealCeremony from './components/RevealCeremony';
import { useResultsLockdown } from './hooks/useResultsLockdown';

const isDev = isDevMode();

function AuthLoader({ children }: { children: React.ReactNode }) {
  const msalAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // Dev mode: check session auth
    if (isDev && !user) {
      devAuthApi.getCurrentUser()
        .then((devUser) => {
          if (devUser) setUser(devUser);
        })
        .catch(() => {});
    }
    // Prod mode: fetch user after MSAL auth
    else if (!isDev && msalAuthenticated && !user && inProgress === InteractionStatus.None) {
      authApi.getCurrentUser()
        .then(setUser)
        .catch((error) => {
          console.error('Failed to fetch user:', error);
        });
    }
  }, [msalAuthenticated, user, inProgress, setUser]);

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const msalAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const { user } = useAuthStore();

  // Dev mode: check Zustand user
  if (isDev) {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  }

  // Prod mode: check MSAL
  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-avenga-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!msalAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Once the final match starts, regular users see only the results countdown —
// no nav, no pages. Admins always get the full app.
function LockdownLayout() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const { loading, active } = useResultsLockdown(isAdmin);

  if (!isAdmin && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (active) {
    return <ResultsCountdown />;
  }

  // Once results are open, greet everyone with a one-time podium celebration.
  return (
    <>
      <RevealCeremony />
      <Layout />
    </>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const msalAuthenticated = useIsAuthenticated();
  const { inProgress } = useMsal();
  const { user } = useAuthStore();

  // Dev mode: check Zustand user
  if (isDev) {
    if (user) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // Prod mode: check MSAL
  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-avenga-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (msalAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthLoader>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <LockdownLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/knockout" element={<Knockout />} />
          <Route path="/bonus" element={<BonusPredictions />} />
          <Route path="/my-predictions" element={<MyPredictions />} />
          <Route path="/users/:userId/predictions" element={<UserPredictions />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/statistics/match/:matchNumber" element={<MatchPredictionStats />} />
          <Route path="/leagues" element={<Leagues />} />
          <Route path="/leagues/:id" element={<LeagueDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/help" element={<Help />} />
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthLoader>
  );
}
