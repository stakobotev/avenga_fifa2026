package com.fifa2026.prode.dto;

import com.fifa2026.prode.entity.League;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeagueDTO {
    private Long id;
    private String name;
    private String description;
    private String inviteCode;
    private UserDTO owner;
    private int memberCount;
    private LocalDateTime createdAt;
    private boolean isPrivate;
    private String prizes;

    public static LeagueDTO fromEntity(League league) {
        return LeagueDTO.builder()
                .id(league.getId())
                .name(league.getName())
                .description(league.getDescription())
                .inviteCode(league.getInviteCode())
                .owner(UserDTO.fromEntity(league.getOwner()))
                .memberCount(league.getMembers().size())
                .createdAt(league.getCreatedAt())
                .isPrivate(league.isPrivate())
                .prizes(league.getPrizes())
                .build();
    }
}
