import { Navigate, useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import MyPredictions from './MyPredictions';

/**
 * Admin-only view of another user's predictions, opened from the leaderboard.
 * Non-admins are redirected away (no change in behavior for them). Reuses the
 * MyPredictions page, just loading a different user's data.
 */
export default function UserPredictions() {
  const { userId } = useParams();
  const location = useLocation();
  const { user } = useAuthStore();

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const id = Number(userId);
  if (!Number.isFinite(id)) {
    return <Navigate to="/leaderboard" replace />;
  }

  const displayName = (location.state as { displayName?: string } | null)?.displayName;

  return (
    <div className="space-y-4">
      <Link to="/leaderboard" className="inline-flex items-center text-sm text-gray-600 hover:text-avenga-red">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Leaderboard
      </Link>
      <MyPredictions userId={id} displayName={displayName} />
    </div>
  );
}
