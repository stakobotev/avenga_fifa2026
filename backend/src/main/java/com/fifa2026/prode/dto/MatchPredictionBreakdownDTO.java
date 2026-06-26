package com.fifa2026.prode.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Per-match breakdown of who predicted the exact score and who predicted the
 * correct winner (correct 1X2 result but not the exact score). Admin-only.
 */
@Data
@Builder
public class MatchPredictionBreakdownDTO {
    private Integer matchNumber;
    private String stage;
    private TeamDTO homeTeam;
    private TeamDTO awayTeam;
    private Integer homeScore;
    private Integer awayScore;

    private List<Row> exactScorers;   // predicted the exact final score
    private List<Row> winnerScorers;  // predicted the correct result, but not exact

    @Data
    @Builder
    public static class Row {
        private Long userId;
        private String displayName;
        private String username;
        private String region;
        private String regionDisplayName;
        private Integer predictedHomeScore;
        private Integer predictedAwayScore;
    }
}
