import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { InteractionStatus, BrowserAuthError } from '@azure/msal-browser';
import { loginRequest } from '../config/authConfig';
import { isDevMode, devAuthApi } from '../config/devAuth';
import { useAuthStore } from '../store/authStore';
import { REGION_DISPLAY_NAMES } from '../types';
import AvengaLogo from '../components/AvengaLogo';

const REGIONS = ['BG_EG', 'CZ_SK', 'UA', 'SEE', 'WE', 'ARG', 'PL', 'OTHER'];

export default function Login() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();
  const { user, setUser } = useAuthStore();

  const [devUsername, setDevUsername] = useState('testuser');
  const [devAdmin, setDevAdmin] = useState(false);
  const [devRegion, setDevRegion] = useState('OTHER');
  const [devLoading, setDevLoading] = useState(false);
  const [devError, setDevError] = useState('');

  const isDev = isDevMode();

  useEffect(() => {
    if (!isDev && isAuthenticated) {
      navigate('/');
    }
    if (isDev && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate, isDev]);

  const handleMsalLogin = async () => {
    try {
      // Check if interaction is already in progress
      if (inProgress !== InteractionStatus.None) {
        console.log('Interaction already in progress, waiting...');
        return;
      }
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
      // Handle stuck interaction state
      if (error instanceof BrowserAuthError && error.errorCode === 'interaction_in_progress') {
        // Clear the stuck state and retry
        sessionStorage.clear();
        window.location.reload();
      }
    }
  };

  const handleDevLogin = async () => {
    setDevError('');
    setDevLoading(true);
    try {
      const loggedInUser = await devAuthApi.login(devUsername, devAdmin, devRegion);
      setUser(loggedInUser);
      navigate('/');
    } catch (error) {
      console.error('Dev login failed:', error);
      setDevError('Login failed. Is the backend running?');
    } finally {
      setDevLoading(false);
    }
  };

  const isLoading = inProgress !== InteractionStatus.None;

  // Dev mode login UI
  if (isDev) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-800 to-purple-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <AvengaLogo className="h-10 w-auto text-avenga-red" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">World Cup 2026 Prode</h1>
            <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              DEV MODE
            </div>
          </div>

          {devError && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {devError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={devUsername}
                onChange={(e) => setDevUsername(e.target.value)}
                className="input"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                id="region"
                value={devRegion}
                onChange={(e) => setDevRegion(e.target.value)}
                className="input"
              >
                {REGIONS.map(r => (
                  <option key={r} value={r}>
                    {REGION_DISPLAY_NAMES[r]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="admin"
                type="checkbox"
                checked={devAdmin}
                onChange={(e) => setDevAdmin(e.target.checked)}
                className="h-4 w-4 text-purple-600 rounded border-gray-300"
              />
              <label htmlFor="admin" className="ml-2 text-sm text-gray-700">
                Login as Admin
              </label>
            </div>

            <button
              onClick={handleDevLogin}
              disabled={devLoading}
              className="w-full btn btn-primary py-3"
            >
              {devLoading ? 'Signing in...' : 'Dev Login'}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Dev mode active because VITE_AZURE_CLIENT_ID is not set
          </p>
        </div>
      </div>
    );
  }

  // Production SSO login UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-purple-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <AvengaLogo className="h-10 w-auto text-avenga-red" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">World Cup 2026 Prode</h1>
          <p className="text-gray-600 mt-2">Sign in with your organization account</p>
        </div>

        <button
          onClick={handleMsalLogin}
          disabled={isLoading}
          className="w-full btn btn-primary py-3 flex items-center justify-center gap-3"
        >
          <MicrosoftIcon className="h-5 w-5" />
          {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Use your company Microsoft account to sign in
        </p>
      </div>
    </div>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
