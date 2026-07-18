package com.fifa2026.prode.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Safe, spoiler-free aggregate stats shown on the sealed-results countdown.
 * Deliberately contains NO rankings, points, or standings.
 */
@Data
@Builder
public class RevealTeaserDTO {
    private long totalPlayers;
    private long totalPredictions;
    private long totalBonusPredictions;
    private long matchesPlayed;

    // Crowd favourite for the title (most-picked champion), safe to show.
    private String favoriteChampionCode;
    private String favoriteChampionName;
    private long favoriteChampionVotes;

    // Most-picked top scorer pick.
    private String favoriteTopScorer;
    private long favoriteTopScorerVotes;
}
