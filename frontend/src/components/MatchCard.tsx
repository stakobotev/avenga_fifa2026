import { useState, useEffect, useMemo } from 'react';
import { Lock, Check, AlertCircle } from 'lucide-react';
import type { Match, Prediction } from '../types';
import { formatMatchDate, formatMatchTime, getCountdown, isMatchLocked } from '../utils/date';
import { predictionApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';

// In-progress prediction input is mirrored to localStorage so it survives a
// page reload or a forced re-auth redirect (otherwise a session expiry mid-edit
// silently discards what the user typed). Cleared once the save is confirmed.
interface PredictionDraft {
  h: string;
  a: string;
  adv?: number;
}

const draftKey = (matchId: number) => `pred_draft_${matchId}`;

function readDraft(matchId: number): PredictionDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(matchId));
    return raw ? (JSON.parse(raw) as PredictionDraft) : null;
  } catch {
    return null;
  }
}

function writeDraft(matchId: number, draft: PredictionDraft) {
  try {
    localStorage.setItem(draftKey(matchId), JSON.stringify(draft));
  } catch {
    /* localStorage unavailable (private mode / quota) — non-fatal */
  }
}

function clearDraft(matchId: number) {
  try {
    localStorage.removeItem(draftKey(matchId));
  } catch {
    /* non-fatal */
  }
}

// Map FIFA 3-letter codes to ISO 2-letter codes for flag CDN
const FIFA_TO_ISO: Record<string, string> = {
  USA: 'us', MEX: 'mx', CAN: 'ca', JAM: 'jm', CRC: 'cr', PAN: 'pa', HON: 'hn', SLV: 'sv', GUA: 'gt', HAI: 'ht', TRI: 'tt', CUB: 'cu',
  ARG: 'ar', BRA: 'br', URU: 'uy', COL: 'co', CHI: 'cl', ECU: 'ec', PER: 'pe', VEN: 've', PAR: 'py', BOL: 'bo',
  GER: 'de', FRA: 'fr', ENG: 'gb-eng', ESP: 'es', ITA: 'it', NED: 'nl', POR: 'pt', BEL: 'be', SUI: 'ch', AUT: 'at',
  WAL: 'gb-wls', SCO: 'gb-sct', NIR: 'gb-nir', IRL: 'ie',
  DEN: 'dk', SWE: 'se', NOR: 'no', FIN: 'fi', ISL: 'is',
  POL: 'pl', CZE: 'cz', SVK: 'sk', HUN: 'hu', UKR: 'ua',
  CRO: 'hr', SRB: 'rs', SLO: 'si', BIH: 'ba', MNE: 'me', ALB: 'al', MKD: 'mk', KOS: 'xk', GRE: 'gr', CYP: 'cy',
  ROU: 'ro', BUL: 'bg', TUR: 'tr', RUS: 'ru', GEO: 'ge', ARM: 'am', AZE: 'az',
  JPN: 'jp', KOR: 'kr', AUS: 'au', IRN: 'ir', KSA: 'sa', QAT: 'qa', UAE: 'ae', CHN: 'cn', IND: 'in', IDN: 'id',
  IRQ: 'iq', SYR: 'sy', JOR: 'jo', OMA: 'om', BHR: 'bh', KUW: 'kw', UZB: 'uz', THA: 'th', VIE: 'vn', MAS: 'my',
  MAR: 'ma', SEN: 'sn', NGA: 'ng', EGY: 'eg', GHA: 'gh', CMR: 'cm', CIV: 'ci', ALG: 'dz', TUN: 'tn', RSA: 'za',
  MLI: 'ml', BFA: 'bf', COD: 'cd', ZAM: 'zm', ZIM: 'zw', ANG: 'ao', MOZ: 'mz', UGA: 'ug', KEN: 'ke', TAN: 'tz',
  NZL: 'nz',
  CUW: 'cw', CPV: 'cv',
};

const getFlagUrl = (code: string): string => {
  const isoCode = FIFA_TO_ISO[code] || code.toLowerCase().slice(0, 2);
  return `https://flagcdn.com/48x36/${isoCode}.png`;
};

interface MatchCardProps {
  match: Match;
  prediction?: Prediction | null;
  onPredictionSaved?: () => void;
}

export default function MatchCard({ match, prediction: initialPrediction, onPredictionSaved }: MatchCardProps) {
  const { isAuthenticated } = useAuthStore();
  // Prefer an unsaved draft (from a prior interrupted edit) over the saved value.
  const initialDraft = useMemo(() => readDraft(match.id), [match.id]);
  const [prediction, setPrediction] = useState(initialPrediction);
  const [homeScore, setHomeScore] = useState(initialDraft?.h ?? (initialPrediction?.predictedHomeScore?.toString() || ''));
  const [awayScore, setAwayScore] = useState(initialDraft?.a ?? (initialPrediction?.predictedAwayScore?.toString() || ''));
  const [advancingTeam, setAdvancingTeam] = useState<number | undefined>(initialDraft?.adv ?? initialPrediction?.predictedAdvancingTeamId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(getCountdown(match.matchDate));

  const locked = isMatchLocked(match.matchDate);
  const isKnockout = match.stage !== 'GROUP';
  const teamsConfirmed = match.teamsConfirmed;

  useEffect(() => {
    if (locked) return;

    const interval = setInterval(() => {
      setCountdown(getCountdown(match.matchDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [match.matchDate, locked]);

  useEffect(() => {
    setPrediction(initialPrediction);
    // A draft (unsaved edit) still wins over the server value after a refetch.
    const draft = readDraft(match.id);
    setHomeScore(draft?.h ?? (initialPrediction?.predictedHomeScore?.toString() || ''));
    setAwayScore(draft?.a ?? (initialPrediction?.predictedAwayScore?.toString() || ''));
    setAdvancingTeam(draft?.adv ?? initialPrediction?.predictedAdvancingTeamId);
  }, [initialPrediction, match.id]);

  // Mirror in-progress edits to localStorage; clear the draft once it matches the
  // saved prediction, is empty, or the match has locked (nothing left to recover).
  useEffect(() => {
    if (locked) {
      clearDraft(match.id);
      return;
    }
    if (!isAuthenticated) return;

    const matchesSaved =
      !!prediction &&
      homeScore === (prediction.predictedHomeScore?.toString() ?? '') &&
      awayScore === (prediction.predictedAwayScore?.toString() ?? '') &&
      advancingTeam === prediction.predictedAdvancingTeamId;

    if (matchesSaved || (homeScore === '' && awayScore === '')) {
      clearDraft(match.id);
    } else {
      writeDraft(match.id, { h: homeScore, a: awayScore, adv: advancingTeam });
    }
  }, [homeScore, awayScore, advancingTeam, locked, isAuthenticated, prediction, match.id]);

  const handleSave = async () => {
    if (!homeScore || !awayScore) {
      setError('Please enter both scores');
      return;
    }

    if (isKnockout && !advancingTeam) {
      setError('Please select who advances');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const saved = await predictionApi.create({
        matchId: match.id,
        predictedHomeScore: parseInt(homeScore),
        predictedAwayScore: parseInt(awayScore),
        predictedAdvancingTeamId: advancingTeam,
      });
      setPrediction(saved);
      clearDraft(match.id); // confirmed persisted — drop the local draft
      onPredictionSaved?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save prediction');
    } finally {
      setSaving(false);
    }
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      'GROUP': 'Group Stage',
      'ROUND_OF_32': 'Round of 32',
      'ROUND_OF_16': 'Round of 16',
      'QUARTERFINAL': 'Quarter-final',
      'SEMIFINAL': 'Semi-final',
      'THIRD_PLACE': 'Third Place',
      'FINAL': 'Final',
    };
    return labels[stage] || stage;
  };

  const hasPrediction = prediction && (prediction.predictedHomeScore !== null || prediction.predictedHomeScore !== undefined);
  const needsPrediction = !locked && !hasPrediction && isAuthenticated && teamsConfirmed;
  const canPredict = teamsConfirmed && !locked && isAuthenticated;

  return (
    <div className={clsx(
      'card relative',
      // Scored matches
      prediction?.scored && 'border-l-4',
      prediction?.scored && prediction.pointsEarned === 5 && 'border-l-green-500',
      prediction?.scored && prediction.pointsEarned && prediction.pointsEarned > 0 && prediction.pointsEarned < 5 && 'border-l-yellow-500',
      prediction?.scored && prediction.pointsEarned === 0 && 'border-l-red-500',
    )}>
      {/* Prediction status badge */}
      {hasPrediction && !prediction?.scored && (
        <div className="absolute top-3 right-3">
          <span className="text-xs text-green-600 font-medium">Predicted</span>
        </div>
      )}
      {needsPrediction && (
        <div className="absolute top-3 right-3">
          <span className="text-xs text-red-500 font-medium">Not predicted</span>
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pr-8">
        <div className="flex items-center space-x-2">
          <span className="badge badge-info">{getStageLabel(match.stage)}</span>
          {match.groupLetter && (
            <span className="badge badge-secondary bg-gray-100 text-gray-700">Group {match.groupLetter}</span>
          )}
        </div>
        {locked && (
          <Lock className="h-4 w-4 text-gray-400" />
        )}
      </div>

      {/* Teams and Scores */}
      <div className="flex items-center justify-between mb-4">
        {/* Home Team */}
        <div className="flex-1 text-center">
          {match.homeTeam ? (
            <>
              <img
                src={getFlagUrl(match.homeTeam.code)}
                alt={match.homeTeam.name}
                className="w-12 h-9 object-contain mx-auto mb-2 rounded shadow"
              />
              <div className="text-xl font-bold mb-1">{match.homeTeam.code}</div>
              <div className="text-xs text-gray-600 truncate px-1">{match.homeTeam.name}</div>
            </>
          ) : (
            <>
              <div className="w-12 h-9 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                <span className="text-gray-400 text-xs">?</span>
              </div>
              <div className="text-xl font-bold mb-1 text-gray-400">{match.homePlaceholder || 'TBD'}</div>
              <div className="text-xs text-gray-400">To be determined</div>
            </>
          )}
        </div>

        {/* Score / Prediction Input */}
        <div className="flex items-center space-x-2 px-2">
          {match.status === 'FINISHED' ? (
            <div className="flex flex-col items-center">
              {/* User's prediction (main figure) */}
              {prediction ? (
                <>
                  <span className="text-[10px] uppercase tracking-wide text-gray-400">Your pick</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-avenga-red">{prediction.predictedHomeScore}</span>
                    <span className="text-gray-400">-</span>
                    <span className="text-2xl font-bold text-avenga-red">{prediction.predictedAwayScore}</span>
                  </div>
                </>
              ) : (
                <span className="text-sm text-gray-400">No prediction</span>
              )}
              {/* Actual final score, below the prediction */}
              <div className="mt-1 text-xs text-gray-500 whitespace-nowrap">
                Final{' '}
                <span className="font-semibold text-gray-700">{match.homeScore}–{match.awayScore}</span>
                {match.homePenaltyScore != null && match.awayPenaltyScore != null && (
                  <span> ({match.homePenaltyScore}-{match.awayPenaltyScore} pen)</span>
                )}
              </div>
            </div>
          ) : canPredict ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="20"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="w-12 h-10 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-avenga-red"
                placeholder="-"
              />
              <span className="text-gray-400 font-bold">:</span>
              <input
                type="number"
                min="0"
                max="20"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="w-12 h-10 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-avenga-red"
                placeholder="-"
              />
            </div>
          ) : prediction ? (
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-avenga-red">{prediction.predictedHomeScore}</span>
              <span className="text-gray-400">-</span>
              <span className="text-xl font-bold text-avenga-red">{prediction.predictedAwayScore}</span>
            </div>
          ) : (
            <div className="text-gray-400">vs</div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 text-center">
          {match.awayTeam ? (
            <>
              <img
                src={getFlagUrl(match.awayTeam.code)}
                alt={match.awayTeam.name}
                className="w-12 h-9 object-contain mx-auto mb-2 rounded shadow"
              />
              <div className="text-xl font-bold mb-1">{match.awayTeam.code}</div>
              <div className="text-xs text-gray-600 truncate px-1">{match.awayTeam.name}</div>
            </>
          ) : (
            <>
              <div className="w-12 h-9 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                <span className="text-gray-400 text-xs">?</span>
              </div>
              <div className="text-xl font-bold mb-1 text-gray-400">{match.awayPlaceholder || 'TBD'}</div>
              <div className="text-xs text-gray-400">To be determined</div>
            </>
          )}
        </div>
      </div>

      {/* Knockout - Who Advances */}
      {isKnockout && canPredict && match.homeTeam && match.awayTeam && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2 text-center">Who advances?</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setAdvancingTeam(match.homeTeam!.id)}
              className={clsx(
                'px-4 py-2 rounded-lg border-2 transition-all flex items-center',
                advancingTeam === match.homeTeam!.id
                  ? 'border-avenga-red bg-red-50 text-avenga-red'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <img
                src={getFlagUrl(match.homeTeam!.code)}
                alt={match.homeTeam!.name}
                className="w-6 h-4 object-contain mr-2 rounded"
              />
              {match.homeTeam!.code}
            </button>
            <button
              onClick={() => setAdvancingTeam(match.awayTeam!.id)}
              className={clsx(
                'px-4 py-2 rounded-lg border-2 transition-all flex items-center',
                advancingTeam === match.awayTeam!.id
                  ? 'border-avenga-red bg-red-50 text-avenga-red'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <img
                src={getFlagUrl(match.awayTeam!.code)}
                alt={match.awayTeam!.name}
                className="w-6 h-4 object-contain mr-2 rounded"
              />
              {match.awayTeam!.code}
            </button>
          </div>
        </div>
      )}

      {/* Match Info */}
      <div className="text-center text-sm text-gray-500 mb-4">
        <div>{formatMatchDate(match.matchDate)} - {formatMatchTime(match.matchDate)}</div>
        <div>{match.venue}, {match.city}</div>
      </div>

      {/* Countdown */}
      {!locked && countdown && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex justify-center space-x-4 text-center">
            <div>
              <div className="text-2xl font-bold text-avenga-red">{countdown.days}</div>
              <div className="text-xs text-gray-500">days</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-avenga-red">{countdown.hours}</div>
              <div className="text-xs text-gray-500">hours</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-avenga-red">{countdown.minutes}</div>
              <div className="text-xs text-gray-500">min</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-avenga-red">{countdown.seconds}</div>
              <div className="text-xs text-gray-500">sec</div>
            </div>
          </div>
        </div>
      )}

      {/* Points Earned */}
      {prediction?.scored && (
        <div className={clsx(
          'text-center py-2 rounded-lg mb-4',
          prediction.pointsEarned === 5 && 'bg-green-100 text-green-800',
          prediction.pointsEarned && prediction.pointsEarned > 0 && prediction.pointsEarned < 5 && 'bg-yellow-100 text-yellow-800',
          prediction.pointsEarned === 0 && 'bg-red-100 text-red-800',
        )}>
          <span className="font-bold">+{prediction.pointsEarned} points</span>
          {prediction.pointsEarned === 5 && <span className="ml-2">Exact Score!</span>}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center text-red-600 text-sm mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {/* Save Button */}
      {canPredict && (
        <button
          onClick={handleSave}
          disabled={saving}
          className={clsx(
            'w-full btn flex items-center justify-center',
            prediction ? 'bg-green-600 hover:bg-green-700 text-white' : 'btn-primary'
          )}
        >
          {saving ? (
            'Saving...'
          ) : prediction ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Update Prediction
            </>
          ) : (
            'Save Prediction'
          )}
        </button>
      )}

      {/* Teams not confirmed message */}
      {!teamsConfirmed && !locked && (
        <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          Teams will be determined after previous round
        </div>
      )}

      {/* Prediction Status */}
      {prediction && locked && !prediction.scored && (
        <div className="text-center text-sm text-gray-500">
          <Check className="h-4 w-4 inline mr-1" />
          Prediction submitted
        </div>
      )}
    </div>
  );
}
