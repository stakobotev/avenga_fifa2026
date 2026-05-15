package com.fifa2026.prode.dto;

import com.fifa2026.prode.entity.Prediction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionDTO {
    private Long id;
    private Long matchId;
    private MatchDTO match;
    private Integer predictedHomeScore;
    private Integer predictedAwayScore;
    private Long predictedAdvancingTeamId;
    private TeamDTO predictedAdvancingTeam;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer pointsEarned;
    private boolean scored;

    public static PredictionDTO fromEntity(Prediction prediction) {
        return PredictionDTO.builder()
                .id(prediction.getId())
                .matchId(prediction.getMatch().getId())
                .match(MatchDTO.fromEntity(prediction.getMatch()))
                .predictedHomeScore(prediction.getPredictedHomeScore())
                .predictedAwayScore(prediction.getPredictedAwayScore())
                .predictedAdvancingTeamId(prediction.getPredictedAdvancingTeam() != null
                        ? prediction.getPredictedAdvancingTeam().getId() : null)
                .predictedAdvancingTeam(TeamDTO.fromEntity(prediction.getPredictedAdvancingTeam()))
                .createdAt(prediction.getCreatedAt())
                .updatedAt(prediction.getUpdatedAt())
                .pointsEarned(prediction.getPointsEarned())
                .scored(prediction.isScored())
                .build();
    }
}
