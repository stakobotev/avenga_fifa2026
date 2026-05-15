import {
  HelpCircle,
  Target,
  Trophy,
  Calendar,
  BarChart2,
  Clock,
  Check,
  Star,
  Award,
  Medal,
  MapPin,
  GitBranch
} from 'lucide-react';

export default function Help() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-900 rounded-2xl p-6 text-white">
        <div className="flex items-center mb-2">
          <HelpCircle className="h-8 w-8 mr-3" />
          <h1 className="text-2xl font-bold">How to Play</h1>
        </div>
        <p className="text-purple-200">
          Your complete guide to the FIFA World Cup 2026 Prediction Game
        </p>
      </div>

      {/* Overview */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
        <p className="text-gray-600 mb-4">
          Welcome to the FIFA World Cup 2026 Prediction Game! Compete with your colleagues
          by predicting match scores and tournament outcomes. Earn points for correct predictions
          and climb the leaderboard.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="font-medium">Predict Scores</p>
            <p className="text-sm text-gray-500">For every match</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium">Earn Points</p>
            <p className="text-sm text-gray-500">Based on accuracy</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <BarChart2 className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="font-medium">Climb Rankings</p>
            <p className="text-sm text-gray-500">Global & regional</p>
          </div>
        </div>
      </div>

      {/* Match Predictions */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Calendar className="h-6 w-6 text-avenga-red mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Match Predictions</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">How to Predict</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-2">
              <li>Go to the <strong>Matches</strong> page to see all upcoming matches</li>
              <li>Find a match you want to predict</li>
              <li>Enter your predicted score for both teams</li>
              <li>Click <strong>"Save Prediction"</strong> to submit</li>
              <li>You can update your prediction anytime before the match starts</li>
            </ol>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800">Important: Deadline</p>
                <p className="text-sm text-orange-700">
                  Predictions are locked when the match starts. Make sure to submit your
                  predictions before kickoff!
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Knockout Matches</h3>
            <p className="text-gray-600">
              For knockout stage matches (Round of 32 onwards), you'll also need to predict
              <strong> which team advances</strong>. This is important when you predict a draw,
              as one team must advance after extra time or penalties.
            </p>
          </div>
        </div>
      </div>

      {/* Scoring System */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Star className="h-6 w-6 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Scoring System</h2>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Points are awarded based on how accurate your prediction is:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">5 pts</div>
              <p className="font-medium text-green-800">Exact Score</p>
              <p className="text-sm text-green-600 mt-1">
                You predicted the exact final score
              </p>
              <div className="mt-3 text-xs text-green-700 bg-green-100 rounded-lg p-2">
                Example: Predicted 2-1, Result 2-1
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">3 pts</div>
              <p className="font-medium text-yellow-800">Correct Result</p>
              <p className="text-sm text-yellow-600 mt-1">
                Right winner/draw, wrong score
              </p>
              <div className="mt-3 text-xs text-yellow-700 bg-yellow-100 rounded-lg p-2">
                Example: Predicted 2-0, Result 3-1
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">0 pts</div>
              <p className="font-medium text-red-800">Wrong Result</p>
              <p className="text-sm text-red-600 mt-1">
                Predicted wrong outcome
              </p>
              <div className="mt-3 text-xs text-red-700 bg-red-100 rounded-lg p-2">
                Example: Predicted 2-0, Result 0-1
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Even if you're unsure about the exact score, predicting
              the correct winner still earns you 3 points!
            </p>
          </div>
        </div>
      </div>

      {/* Bonus Predictions */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Bonus Predictions</h2>
        </div>

        <p className="text-gray-600 mb-4">
          Earn extra points by predicting tournament outcomes before the World Cup begins:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center p-4 bg-yellow-50 rounded-xl">
            <Trophy className="h-10 w-10 text-yellow-500 mr-4" />
            <div>
              <p className="font-bold text-gray-900">World Cup Champion</p>
              <p className="text-sm text-gray-500">Predict the winner</p>
              <p className="text-lg font-bold text-green-600">+15 points</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-xl">
            <Medal className="h-10 w-10 text-gray-400 mr-4" />
            <div>
              <p className="font-bold text-gray-900">Runner-up</p>
              <p className="text-sm text-gray-500">Predict second place</p>
              <p className="text-lg font-bold text-green-600">+10 points</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-amber-50 rounded-xl">
            <Award className="h-10 w-10 text-amber-600 mr-4" />
            <div>
              <p className="font-bold text-gray-900">Third Place</p>
              <p className="text-sm text-gray-500">Predict third place</p>
              <p className="text-lg font-bold text-green-600">+8 points</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-blue-50 rounded-xl">
            <Star className="h-10 w-10 text-blue-500 mr-4" />
            <div>
              <p className="font-bold text-gray-900">Top Scorer</p>
              <p className="text-sm text-gray-500">Predict the Golden Boot winner</p>
              <p className="text-lg font-bold text-green-600">+10 points</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Deadline: Tournament Start</p>
              <p className="text-sm text-red-700">
                Bonus predictions are locked once the World Cup begins. Make your picks
                before the first match!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Knockout Stage */}
      <div className="card">
        <div className="flex items-center mb-4">
          <GitBranch className="h-6 w-6 text-purple-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Knockout Stage</h2>
        </div>

        <p className="text-gray-600 mb-4">
          The Knockout page shows the tournament bracket from Round of 32 to the Final:
        </p>

        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>View all knockout matches organized by round</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>See countdown timers for each stage</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Teams appear automatically as they qualify from the group stage</span>
          </li>
          <li className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Track results and upcoming fixtures</span>
          </li>
        </ul>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <div className="flex items-center mb-4">
          <BarChart2 className="h-6 w-6 text-green-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
        </div>

        <p className="text-gray-600 mb-4">
          Track your progress and compete with others:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <Trophy className="h-5 w-5 text-purple-600 mr-2" />
              <p className="font-bold text-gray-900">Global Ranking</p>
            </div>
            <p className="text-sm text-gray-600">
              Compete against all participants worldwide. See where you stand overall.
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              <p className="font-bold text-gray-900">Regional Ranking</p>
            </div>
            <p className="text-sm text-gray-600">
              Compete within your region. Your region is automatically detected from
              your organization profile.
            </p>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p><strong>Regions:</strong> BG & EG, CZ & SK, UA, SEE, WE, ARG, PL, Other</p>
        </div>
      </div>

      {/* Tips */}
      <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tips for Success</h2>

        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
            <p className="text-gray-700"><strong>Predict early:</strong> Don't wait until the last minute - predictions lock at kickoff!</p>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
            <p className="text-gray-700"><strong>Set bonus predictions:</strong> These can earn you up to 43 extra points!</p>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
            <p className="text-gray-700"><strong>Check the Dashboard:</strong> See your stats and upcoming matches at a glance.</p>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</div>
            <p className="text-gray-700"><strong>Aim for exact scores:</strong> 5 points vs 3 points adds up over 64 matches!</p>
          </div>
        </div>
      </div>

      {/* Good Luck */}
      <div className="text-center py-6">
        <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Good Luck!</h2>
        <p className="text-gray-600">May the best predictor win!</p>
      </div>
    </div>
  );
}
