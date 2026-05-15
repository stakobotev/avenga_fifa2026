import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Star, Lock } from 'lucide-react';
import type { Team, BonusPrediction } from '../types';
import { teamApi, predictionApi } from '../services/api';
import clsx from 'clsx';

// Map FIFA 3-letter codes to ISO 2-letter codes for flag CDN
const FIFA_TO_ISO: Record<string, string> = {
  // North & Central America / Caribbean
  USA: 'us', MEX: 'mx', CAN: 'ca', JAM: 'jm', CRC: 'cr', PAN: 'pa', HON: 'hn', SLV: 'sv', GUA: 'gt', HAI: 'ht', TRI: 'tt', CUB: 'cu',
  // South America
  ARG: 'ar', BRA: 'br', URU: 'uy', COL: 'co', CHI: 'cl', ECU: 'ec', PER: 'pe', VEN: 've', PAR: 'py', BOL: 'bo',
  // Western Europe
  GER: 'de', FRA: 'fr', ENG: 'gb-eng', ESP: 'es', ITA: 'it', NED: 'nl', POR: 'pt', BEL: 'be', SUI: 'ch', AUT: 'at',
  // British Isles
  WAL: 'gb-wls', SCO: 'gb-sct', NIR: 'gb-nir', IRL: 'ie',
  // Northern Europe
  DEN: 'dk', SWE: 'se', NOR: 'no', FIN: 'fi', ISL: 'is',
  // Central Europe
  POL: 'pl', CZE: 'cz', SVK: 'sk', HUN: 'hu', UKR: 'ua',
  // Southern Europe
  CRO: 'hr', SRB: 'rs', SLO: 'si', BIH: 'ba', MNE: 'me', ALB: 'al', MKD: 'mk', KOS: 'xk', GRE: 'gr', CYP: 'cy',
  // Eastern Europe
  ROU: 'ro', BUL: 'bg', TUR: 'tr', RUS: 'ru', GEO: 'ge', ARM: 'am', AZE: 'az',
  // Asia
  JPN: 'jp', KOR: 'kr', AUS: 'au', IRN: 'ir', KSA: 'sa', QAT: 'qa', UAE: 'ae', CHN: 'cn', IND: 'in', IDN: 'id',
  IRQ: 'iq', SYR: 'sy', JOR: 'jo', OMA: 'om', BHR: 'bh', KUW: 'kw', UZB: 'uz', THA: 'th', VIE: 'vn', MAS: 'my',
  // Africa
  MAR: 'ma', SEN: 'sn', NGA: 'ng', EGY: 'eg', GHA: 'gh', CMR: 'cm', CIV: 'ci', ALG: 'dz', TUN: 'tn', RSA: 'za',
  MLI: 'ml', BFA: 'bf', COD: 'cd', ZAM: 'zm', ZIM: 'zw', ANG: 'ao', MOZ: 'mz', UGA: 'ug', KEN: 'ke', TAN: 'tz',
  // Oceania
  NZL: 'nz',
};

const getFlagUrl = (code: string): string => {
  const isoCode = FIFA_TO_ISO[code] || code.toLowerCase().slice(0, 2);
  return `https://flagcdn.com/w80/${isoCode}.png`;
};

interface BonusPredictionsProps {
  predictions: BonusPrediction[];
  locked?: boolean;
  onUpdate?: () => void;
}

export default function BonusPredictions({ predictions, locked = false, onUpdate }: BonusPredictionsProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const bonusTypes = [
    { type: 'CHAMPION', label: 'World Cup Champion', icon: Trophy, points: 15, color: 'text-yellow-500' },
    { type: 'RUNNER_UP', label: 'Runner-up', icon: Medal, points: 10, color: 'text-gray-400' },
    { type: 'THIRD_PLACE', label: 'Third Place', icon: Award, points: 8, color: 'text-amber-600' },
    { type: 'TOP_SCORER', label: 'Top Scorer', icon: Star, points: 10, color: 'text-blue-500' },
  ];

  useEffect(() => {
    teamApi.getAll().then(setTeams).finally(() => setLoading(false));
  }, []);

  const getPrediction = (type: string) => {
    return predictions.find(p => p.predictionType === type);
  };

  const handleTeamSelect = async (type: string, teamId: number) => {
    if (locked || saving) return;

    setSaving(type);
    try {
      await predictionApi.createBonus({
        predictionType: type,
        selectedTeamId: teamId,
      });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to save bonus prediction:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleTopScorerChange = async (playerName: string) => {
    if (locked || saving) return;

    setSaving('TOP_SCORER');
    try {
      await predictionApi.createBonus({
        predictionType: 'TOP_SCORER',
        selectedPlayerName: playerName,
      });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to save bonus prediction:', error);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Bonus Predictions</h2>
        {locked && (
          <div className="flex items-center text-gray-500 text-sm">
            <Lock className="h-4 w-4 mr-1" />
            Locked
          </div>
        )}
      </div>

      <div className="space-y-6">
        {bonusTypes.map(({ type, label, icon: Icon, points, color }) => {
          const prediction = getPrediction(type);
          const isTopScorer = type === 'TOP_SCORER';

          return (
            <div key={type} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Icon className={clsx('h-5 w-5 mr-2', color)} />
                  <span className="font-medium">{label}</span>
                </div>
                <span className="badge badge-info">+{points} pts</span>
              </div>

              {isTopScorer ? (
                <div>
                  <input
                    type="text"
                    placeholder="Enter player name"
                    defaultValue={prediction?.selectedPlayerName || ''}
                    onBlur={(e) => handleTopScorerChange(e.target.value)}
                    disabled={locked}
                    className="input"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {teams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(type, team.id)}
                      disabled={locked || saving === type}
                      className={clsx(
                        'p-1.5 rounded-lg border-2 text-center transition-all',
                        prediction?.selectedTeam?.id === team.id
                          ? 'border-avenga-red bg-red-50 text-avenga-red'
                          : 'border-gray-200 hover:border-gray-400 bg-white',
                        locked && 'opacity-50 cursor-not-allowed'
                      )}
                      title={team.name}
                    >
                      <div className="flex flex-col items-center">
                        <img
                          src={getFlagUrl(team.code)}
                          alt={team.name}
                          className="w-full h-5 object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-[10px] font-medium mt-1 leading-none">{team.code}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {prediction?.scored && (
                <div className={clsx(
                  'mt-3 p-2 rounded text-center text-sm',
                  prediction.pointsEarned && prediction.pointsEarned > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                )}>
                  {prediction.pointsEarned && prediction.pointsEarned > 0
                    ? `+${prediction.pointsEarned} points earned!`
                    : 'No points - incorrect prediction'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
