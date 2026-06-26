import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AdminUserLinkProps {
  userId: number;
  displayName: string;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps a leaderboard player name. For ADMIN users it becomes a clickable link
 * to that user's predictions page; for everyone else it renders the children
 * unchanged, so non-admins see no difference.
 */
export default function AdminUserLink({ userId, displayName, className, children }: AdminUserLinkProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (user?.role !== 'ADMIN') {
    return <>{children}</>;
  }

  return (
    <button
      type="button"
      onClick={() => navigate(`/users/${userId}/predictions`, { state: { displayName } })}
      className={className ?? 'text-left hover:underline focus:underline cursor-pointer'}
      title="View this user's predictions (admin)"
    >
      {children}
    </button>
  );
}
