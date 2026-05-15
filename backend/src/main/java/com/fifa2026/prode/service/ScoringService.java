package com.fifa2026.prode.service;

import com.fifa2026.prode.entity.BonusPrediction;
import com.fifa2026.prode.entity.Match;
import com.fifa2026.prode.entity.Prediction;
import org.springframework.stereotype.Service;

@Service
public class ScoringService {

    // Group Stage Points
    private static final int GROUP_EXACT_SCORE = 5;
    private static final int GROUP_CORRECT_RESULT = 3;

    // Knockout Stage Points
    private static final int KNOCKOUT_EXACT_SCORE = 5;
    private static final int KNOCKOUT_CORRECT_ADVANCING = 4;
    private static final int KNOCKOUT_CORRECT_RESULT_WRONG_ADVANCING = 2;

    // Bonus Points
    private static final int BONUS_CHAMPION = 15;
    private static final int BONUS_RUNNER_UP = 10;
    private static final int BONUS_THIRD_PLACE = 8;
    private static final int BONUS_TOP_SCORER = 10;

    public int calculateMatchPredictionPoints(Prediction prediction, Match match) {
        if (match.getHomeScore() == null || match.getAwayScore() == null) {
            return 0;
        }

        int predictedHome = prediction.getPredictedHomeScore();
        int predictedAway = prediction.getPredictedAwayScore();
        int actualHome = match.getHomeScore();
        int actualAway = match.getAwayScore();

        if (match.getStage() == Match.Stage.GROUP) {
            return calculateGroupStagePoints(predictedHome, predictedAway, actualHome, actualAway);
        } else {
            return calculateKnockoutStagePoints(prediction, match, predictedHome, predictedAway, actualHome, actualAway);
        }
    }

    private int calculateGroupStagePoints(int predictedHome, int predictedAway, int actualHome, int actualAway) {
        // Exact score
        if (predictedHome == actualHome && predictedAway == actualAway) {
            return GROUP_EXACT_SCORE;
        }

        // Correct result (1X2)
        if (getResult(predictedHome, predictedAway) == getResult(actualHome, actualAway)) {
            return GROUP_CORRECT_RESULT;
        }

        return 0;
    }

    private int calculateKnockoutStagePoints(Prediction prediction, Match match,
                                              int predictedHome, int predictedAway,
                                              int actualHome, int actualAway) {
        boolean exactScore = (predictedHome == actualHome && predictedAway == actualAway);
        boolean correctResult = getResult(predictedHome, predictedAway) == getResult(actualHome, actualAway);

        Long predictedAdvancingId = prediction.getPredictedAdvancingTeam() != null
                ? prediction.getPredictedAdvancingTeam().getId() : null;
        Long actualWinnerId = match.getWinnerTeam() != null ? match.getWinnerTeam().getId() : null;

        boolean correctAdvancing = predictedAdvancingId != null && predictedAdvancingId.equals(actualWinnerId);

        // Exact score (90 min)
        if (exactScore) {
            return KNOCKOUT_EXACT_SCORE;
        }

        // Correct advancing team
        if (correctAdvancing) {
            return KNOCKOUT_CORRECT_ADVANCING;
        }

        // Correct 90-min result but wrong advancing team
        if (correctResult && !correctAdvancing) {
            return KNOCKOUT_CORRECT_RESULT_WRONG_ADVANCING;
        }

        return 0;
    }

    private int getResult(int home, int away) {
        if (home > away) return 1;  // Home win
        if (home < away) return 2;  // Away win
        return 0;  // Draw
    }

    public int calculateBonusPoints(BonusPrediction.BonusType type) {
        return switch (type) {
            case CHAMPION -> BONUS_CHAMPION;
            case RUNNER_UP -> BONUS_RUNNER_UP;
            case THIRD_PLACE -> BONUS_THIRD_PLACE;
            case TOP_SCORER -> BONUS_TOP_SCORER;
        };
    }
}
