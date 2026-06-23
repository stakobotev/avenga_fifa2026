package com.fifa2026.prode.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Outcome of settling the TOP_SCORER bonus against a chosen player name.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopScorerAwardResult {
    /** The player name the bonus was settled against. */
    private String playerName;
    /** Number of users whose pick matched and were awarded points. */
    private int matched;
    /** Total TOP_SCORER predictions that were settled (matched + not). */
    private int total;
    /** Points awarded to each matching prediction. */
    private int pointsEach;
}
