package com.fifa2026.prode.dto;

import com.fifa2026.prode.entity.Team;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamDTO {
    private Long id;
    private String name;
    private String code;
    private String flagUrl;
    private String groupLetter;
    private Integer fifaRanking;
    private String confederation;

    public static TeamDTO fromEntity(Team team) {
        if (team == null) return null;
        return TeamDTO.builder()
                .id(team.getId())
                .name(team.getName())
                .code(team.getCode())
                .flagUrl(team.getFlagUrl())
                .groupLetter(team.getGroupLetter())
                .fifaRanking(team.getFifaRanking())
                .confederation(team.getConfederation())
                .build();
    }
}
