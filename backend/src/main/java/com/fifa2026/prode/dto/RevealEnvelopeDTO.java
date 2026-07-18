package com.fifa2026.prode.dto;

import lombok.Builder;
import lombok.Data;

/**
 * A user's personal "sealed envelope" for the countdown screen: their own
 * tournament footprint, without leaking their rank or total points.
 */
@Data
@Builder
public class RevealEnvelopeDTO {
    private String displayName;
    private String region;
    private long predictionsMade;
    private long bonusPredictionsMade;
    private long exactScores;
}
