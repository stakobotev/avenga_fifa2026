package com.fifa2026.prode.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BonusPredictionRequest {
    @NotNull(message = "Prediction type is required")
    private String predictionType;

    private Long selectedTeamId;

    private String selectedPlayerName;
}
