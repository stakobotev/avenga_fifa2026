package com.fifa2026.prode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Aggregated prediction statistics, scoped to FINISHED matches only.
 *
 * Match-based figures (totalUsers, totalPredictions, exactScore, onlyWinner, regions, matches)
 * count only predictions on matches that have already been played. Bonus figures
 * (topScorers, champion, runnerUp, thirdPlace) are tournament-wide survey snapshots.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatisticsOverviewDTO {

    // --- Summary KPIs (over finished matches) ---
    private long totalUsers;          // distinct users with at least one prediction on a finished match
    private long totalPredictions;    // predictions on finished matches
    private long exactScore;          // predictions with exact score
    private long onlyWinner;          // predictions with correct result but NOT exact score

    // --- Bonus survey (tournament-wide) ---
    private List<PlayerStat> topScorers;
    private List<TeamStat> champion;
    private List<TeamStat> runnerUp;
    private List<TeamStat> thirdPlace;

    // --- Actual bonus outcomes (final results, with how many players nailed each) ---
    private List<BonusResult> bonusResults;

    // --- Regional breakdown (over finished matches) ---
    private List<RegionStat> regions;
    private RegionStat regionsTotal;

    // --- Per finished match accuracy ---
    private List<MatchAccuracy> matches;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlayerStat {
        private String name;
        private long count;
        private double pct;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TeamStat {
        private String code;
        private String name;
        private String flagUrl;
        private long count;
        private double pct;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegionStat {
        private String region;             // enum name, e.g. "SEE"
        private String regionDisplayName;  // e.g. "SEE", "BG & EG"
        private long usersWithPredictions;
        private long totalPredictions;
        private long exactScore;
        private long onlyWinner;
        private double sharePct;           // share of grand-total predictions
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BonusResult {
        private String type;               // CHAMPION, RUNNER_UP, THIRD_PLACE, TOP_SCORER
        private String label;              // "Champion", "Top Scorer", ...
        private List<BonusWinner> winners; // the actual winner(s); may be several (e.g. tied top scorers)
        private long correct;              // how many players predicted it right
        private long totalPicks;           // how many players made this pick
        private double pct;                // correct / totalPicks
        private int pointsEach;            // points a correct pick earned
        private boolean settled;           // whether the outcome is known
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BonusWinner {
        private String name;      // team name or player name
        private String code;      // team code for the flag (null for a player)
        private String flagUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchAccuracy {
        private Integer matchNumber;
        private String stage;
        private TeamDTO homeTeam;
        private TeamDTO awayTeam;
        private Integer homeScore;
        private Integer awayScore;
        private long predictions;
        private long exactScore;
        private double exactPct;
        private long correctWinner;        // includes exact-score predictions
        private double correctWinnerPct;
    }
}
