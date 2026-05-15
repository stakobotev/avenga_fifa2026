package com.fifa2026.prode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntryDTO {
    private int rank;
    private UserDTO user;
    private int totalPoints;
    private int matchPoints;
    private int bonusPoints;
    private int exactScores;
    private int correctPredictions;
    private int totalPredictions;
}
