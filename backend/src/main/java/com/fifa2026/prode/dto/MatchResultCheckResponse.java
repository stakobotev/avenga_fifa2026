package com.fifa2026.prode.dto;

import lombok.Data;

/**
 * Result of asking the external scoring service for a single match's result,
 * aligned to our stored home/away orientation. Nothing is persisted — this is
 * only shown to an admin so they can compare it against the stored result and
 * decide whether to apply it.
 */
@Data
public class MatchResultCheckResponse {
    /** True when the service returned a usable final score for this match. */
    private boolean found;

    /** Raw status from the external service (e.g. FINISHED, IN_PLAY), if any. */
    private String status;

    private Integer homeScore;
    private Integer awayScore;

    private Integer homePenaltyScore;
    private Integer awayPenaltyScore;

    /** Derived advancing team for knockout matches (our team id), if determinable. */
    private Long winnerTeamId;

    /** Human-readable note, used mainly when found == false. */
    private String message;
}
