package com.fifa2026.prode.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PredictionRequest {
    @NotNull(message = "Match ID is required")
    private Long matchId;

    @NotNull(message = "Predicted home score is required")
    @Min(value = 0, message = "Score cannot be negative")
    private Integer predictedHomeScore;

    @NotNull(message = "Predicted away score is required")
    @Min(value = 0, message = "Score cannot be negative")
    private Integer predictedAwayScore;

    private Long predictedAdvancingTeamId;
}
