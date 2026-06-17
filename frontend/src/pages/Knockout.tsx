import { useState, useEffect } from 'react';
import { Trophy, Clock, Calendar, Check, X } from 'lucide-react';
import { matchApi, predictionApi } from '../services/api';
import MatchCard from '../components/MatchCard';
import type { Match, Prediction } from '../types';
import clsx from 'clsx';

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

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const getCountdown = (targetDate: string): CountdownTime | null => {
  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  const diff = target - now;

  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
};

const KNOCKOUT_STAGES = [
  { key: 'ROUND_OF_32', label: 'Round of 32', matchCount: 16 },
  { key: 'ROUND_OF_16', label: 'Round of 16', matchCount: 8 },
  { key: 'QUARTERFINAL', label: 'Quarter-finals', matchCount: 4 },
  { key: 'SEMIFINAL', label: 'Semi-finals', matchCount: 2 },
  { key: 'THIRD_PLACE', label: 'Third Place Play-off', matchCount: 1 },
  { key: 'FINAL', label: 'Final', matchCount: 1 },
];

export default function Knockout() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Map<number, Prediction>>(new Map());
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState<Record<string, CountdownTime | null>>({});

  useEffect(() => {
    // Load the bracket and the user's predictions independently so one failing
    // doesn't blank the other.
    Promise.allSettled([
      matchApi.getAll(),
      predictionApi.getMyPredictions(),
    ]).then(([matchesRes, predsRes]) => {
      if (matchesRes.status === 'fulfilled') {
        setMatches(matchesRes.value.filter(m => m.stage !== 'GROUP'));
      }
      if (predsRes.status === 'fulfilled') {
        setPredictions(new Map(predsRes.value.map(p => [p.matchId, p])));
      }
    }).finally(() => setLoading(false));
  }, []);

  const refreshPredictions = async () => {
    try {
      const preds = await predictionApi.getMyPredictions();
      setPredictions(new Map(preds.map(p => [p.matchId, p])));
    } catch {
      // keep existing predictions on failure
    }
  };

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<string, CountdownTime | null> = {};
      KNOCKOUT_STAGES.forEach(stage => {
        const stageMatches = matches.filter(m => m.stage === stage.key);
        if (stageMatches.length > 0) {
          const earliestMatch = stageMatches.reduce((earliest, match) =>
            new Date(match.matchDate) < new Date(earliest.matchDate) ? match : earliest
          );
          newCountdowns[stage.key] = getCountdown(earliestMatch.matchDate);
        }
      });
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [matches]);

  const getStageMatches = (stageKey: string) => {
    return matches.filter(m => m.stage === stageKey);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-900 rounded-2xl p-6 text-white">
        <div className="flex items-center mb-2">
          <Trophy className="h-8 w-8 mr-3 text-yellow-400" />
          <h1 className="text-2xl font-bold">Knockout Stage</h1>
        </div>
        <p className="text-purple-200">
          The road to the World Cup 2026 Final
        </p>
        <p className="mt-2 text-sm text-purple-300">
          Click any match with confirmed teams to predict the score and who advances.
        </p>
      </div>

      {/* Knockout Stages */}
      {KNOCKOUT_STAGES.map((stage) => {
        const stageMatches = getStageMatches(stage.key);
        const countdown = countdowns[stage.key];
        const hasStarted = stageMatches.some(m => m.status === 'FINISHED' || m.status === 'LIVE');
        const isUpcoming = !hasStarted && countdown !== null;

        return (
          <div key={stage.key} className="card">
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className={clsx(
                  'p-3 rounded-xl mr-4',
                  stage.key === 'FINAL' ? 'bg-yellow-100' : 'bg-purple-100'
                )}>
                  {stage.key === 'FINAL' ? (
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <Calendar className="h-6 w-6 text-purple-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{stage.label}</h2>
                  <p className="text-sm text-gray-500">{stage.matchCount} {stage.matchCount === 1 ? 'match' : 'matches'}</p>
                </div>
              </div>

              {/* Countdown */}
              {isUpcoming && countdown && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Starts in</p>
                  <div className="flex items-center space-x-2">
                    <div className="text-center">
                      <span className="text-xl font-bold text-avenga-red">{countdown.days}</span>
                      <span className="text-xs text-gray-500 ml-1">d</span>
                    </div>
                    <span className="text-gray-400">:</span>
                    <div className="text-center">
                      <span className="text-xl font-bold text-avenga-red">{countdown.hours}</span>
                      <span className="text-xs text-gray-500 ml-1">h</span>
                    </div>
                    <span className="text-gray-400">:</span>
                    <div className="text-center">
                      <span className="text-xl font-bold text-avenga-red">{countdown.minutes}</span>
                      <span className="text-xs text-gray-500 ml-1">m</span>
                    </div>
                    <span className="text-gray-400">:</span>
                    <div className="text-center">
                      <span className="text-xl font-bold text-avenga-red">{countdown.seconds}</span>
                      <span className="text-xs text-gray-500 ml-1">s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Matches Grid */}
            {stageMatches.length > 0 ? (
              <div className={clsx(
                'grid gap-4',
                stage.key === 'FINAL' || stage.key === 'THIRD_PLACE' ? 'grid-cols-1 max-w-md mx-auto' :
                stage.key === 'SEMIFINAL' ? 'grid-cols-1 md:grid-cols-2' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              )}>
                {stageMatches.map((match) => {
                  const userPrediction = predictions.get(match.id);
                  const clickable = match.teamsConfirmed;
                  return (
                  <div
                    key={match.id}
                    onClick={() => clickable && setSelectedMatch(match)}
                    className={clsx(
                      'border rounded-xl p-4',
                      match.status === 'FINISHED' ? 'bg-gray-50' : 'bg-white',
                      stage.key === 'FINAL' && 'border-yellow-300 border-2',
                      clickable && 'cursor-pointer hover:shadow-md hover:border-purple-300 transition-all'
                    )}
                  >
                    {/* Match Date/Time */}
                    <div className="text-center text-xs text-gray-500 mb-3">
                      {formatDate(match.matchDate)} · {formatTime(match.matchDate)}
                    </div>

                    {/* Teams */}
                    <div className="flex items-center justify-between">
                      {/* Home Team */}
                      <div className="flex-1 text-center">
                        {match.homeTeam ? (
                          <>
                            <img
                              src={getFlagUrl(match.homeTeam.code)}
                              alt={match.homeTeam.name}
                              className="w-10 h-7 object-contain mx-auto mb-1 rounded shadow-sm"
                            />
                            <p className="font-bold text-sm">{match.homeTeam.code}</p>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-7 bg-gray-200 rounded mx-auto mb-1 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">?</span>
                            </div>
                            <p className="font-bold text-sm text-gray-400">{match.homePlaceholder || 'TBD'}</p>
                          </>
                        )}
                      </div>

                      {/* Score */}
                      <div className="px-3">
                        {match.status === 'FINISHED' ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold">{match.homeScore}</span>
                            <span className="text-gray-400">-</span>
                            <span className="text-lg font-bold">{match.awayScore}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">vs</span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 text-center">
                        {match.awayTeam ? (
                          <>
                            <img
                              src={getFlagUrl(match.awayTeam.code)}
                              alt={match.awayTeam.name}
                              className="w-10 h-7 object-contain mx-auto mb-1 rounded shadow-sm"
                            />
                            <p className="font-bold text-sm">{match.awayTeam.code}</p>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-7 bg-gray-200 rounded mx-auto mb-1 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">?</span>
                            </div>
                            <p className="font-bold text-sm text-gray-400">{match.awayPlaceholder || 'TBD'}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="text-center text-xs text-gray-400 mt-3">
                      {match.venue}
                    </div>

                    {/* Prediction status / call to action */}
                    {clickable && (
                      <div className="mt-3 border-t pt-2 text-center text-xs">
                        {userPrediction ? (
                          <span className="inline-flex items-center justify-center gap-1 font-medium text-green-600">
                            <Check className="h-3.5 w-3.5" />
                            Your pick: {userPrediction.predictedHomeScore}–{userPrediction.predictedAwayScore}
                          </span>
                        ) : match.locked ? (
                          <span className="text-gray-400">No prediction</span>
                        ) : (
                          <span className="font-medium text-avenga-red">Click to predict →</span>
                        )}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Matches will be scheduled after the group stage</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Prediction modal — reuses the same MatchCard used on the Matches page */}
      {selectedMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedMatch(null)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex justify-end">
              <button
                onClick={() => setSelectedMatch(null)}
                className="rounded-full p-1 text-white hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <MatchCard
              match={selectedMatch}
              prediction={predictions.get(selectedMatch.id) || null}
              onPredictionSaved={refreshPredictions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
