package com.fifa2026.prode.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Outcome of settling a team-based bonus (CHAMPION, RUNNER_UP, THIRD_PLACE)
 * against a chosen team.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BonusAwardResult {
    /** The bonus type that was settled. */
    private String predictionType;
    /** The team the bonus was settled against (display name). */
    private String awardedLabel;
    /** Number of users whose pick matched and were awarded points. */
    private int matched;
    /** Total predictions of this type that were settled. */
    private int total;
    /** Points awarded to each matching prediction. */
    private int pointsEach;
}
