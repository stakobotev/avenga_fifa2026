import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useAuthStore } from '../store/authStore';
import { isDevMode, devAuthApi } from '../config/devAuth';
import { Home, Calendar, BarChart2, LogOut, User, Menu, X, Settings, Trophy, GitBranch, HelpCircle, ListChecks } from 'lucide-react';
import { useState } from 'react';
import AvengaLogo from './AvengaLogo';

export default function Layout() {
  const { user, clearUser } = useAuthStore();
  const msalAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDev = isDevMode();
  const isAuthenticated = isDev ? !!user : msalAuthenticated;

  const handleLogout = async () => {
    clearUser();
    if (isDev) {
      await devAuthApi.logout();
      navigate('/login');
    } else {
      instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Matches', href: '/matches', icon: Calendar },
    { name: 'Knockout', href: '/knockout', icon: GitBranch },
    { name: 'Bonus', href: '/bonus', icon: Trophy },
    { name: 'My Predictions', href: '/my-predictions', icon: ListChecks },
    { name: 'Leaderboard', href: '/leaderboard', icon: BarChart2 },
    { name: 'Help', href: '/help', icon: HelpCircle },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-purple-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <AvengaLogo className="h-6 w-auto text-avenga-red" />
                <span className="text-white font-bold text-lg hidden sm:block">World Cup 2026</span>
              </Link>

              {isAuthenticated && (
                <div className="hidden md:flex ml-10 space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-200 hover:text-white hover:bg-purple-700 rounded-md transition-colors"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="hidden md:flex items-center space-x-4">
                    <Link
                      to="/profile"
                      className="flex items-center text-gray-200 hover:text-white"
                    >
                      <User className="h-5 w-5 mr-2" />
                      <span>{user?.displayName}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center text-gray-200 hover:text-white"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>

                  <button
                    className="md:hidden text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-200 hover:text-white font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden bg-purple-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-3 py-2 text-base font-medium text-white hover:bg-purple-600 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 text-base font-medium text-white hover:bg-purple-600 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-white hover:bg-purple-600 rounded-md"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-purple-800 text-gray-300 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AvengaLogo className="h-5 w-auto text-avenga-red mx-auto mb-3" />
          <p>FIFA World Cup 2026 Prode - Internal League</p>
          <p className="text-sm mt-2 text-gray-400">Predict. Compete. Win.</p>
        </div>
      </footer>
    </div>
  );
}
