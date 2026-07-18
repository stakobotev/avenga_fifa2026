import { useEffect, useState } from 'react';
import { matchApi } from '../services/api';
import { RESULTS_REVEAL_AT } from '../config/reveal';

export interface ResultsLockdownState {
  loading: boolean;       // still figuring out when the final kicks off
  active: boolean;        // final has started AND we're before the reveal (non-admins only)
  finalKickoff: Date | null;
  revealAt: Date;
}

/**
 * Regular users are locked out of the app between the final match kickoff and
 * the results reveal, so nobody can peek at the standings before the big moment.
 * Admins are never locked out — pass isAdmin=true to short-circuit.
 */
export function useResultsLockdown(isAdmin: boolean): ResultsLockdownState {
  const [finalKickoff, setFinalKickoff] = useState<Date | null>(null);
  const [loading, setLoading] = useState(!isAdmin);
  const [now, setNow] = useState(() => new Date());

  // Find when the final match kicks off (admins don't need this).
  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    matchApi.getAll()
      .then((matches) => {
        if (cancelled) return;
        const finalMatch = matches.find(m => m.stage === 'FINAL' && m.matchDate);
        setFinalKickoff(finalMatch ? new Date(finalMatch.matchDate) : null);
      })
      .catch(() => { if (!cancelled) setFinalKickoff(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAdmin]);

  // Tick every second so the lockdown flips on/off exactly at kickoff and reveal.
  useEffect(() => {
    if (isAdmin) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isAdmin]);

  const finalStarted = !!finalKickoff && now >= finalKickoff;
  const beforeReveal = now < RESULTS_REVEAL_AT;
  const active = !isAdmin && finalStarted && beforeReveal;

  return { loading, active, finalKickoff, revealAt: RESULTS_REVEAL_AT };
}
