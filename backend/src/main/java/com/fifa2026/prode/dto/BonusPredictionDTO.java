package com.fifa2026.prode.dto;

import com.fifa2026.prode.entity.BonusPrediction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BonusPredictionDTO {
    private Long id;
    private String predictionType;
    private TeamDTO selectedTeam;
    private String selectedPlayerName;
    private LocalDateTime createdAt;
    private Integer pointsEarned;
    private boolean scored;

    public static BonusPredictionDTO fromEntity(BonusPrediction bp) {
        return BonusPredictionDTO.builder()
                .id(bp.getId())
                .predictionType(bp.getPredictionType().name())
                .selectedTeam(TeamDTO.fromEntity(bp.getSelectedTeam()))
                .selectedPlayerName(bp.getSelectedPlayerName())
                .createdAt(bp.getCreatedAt())
                .pointsEarned(bp.getPointsEarned())
                .scored(bp.isScored())
                .build();
    }
}
