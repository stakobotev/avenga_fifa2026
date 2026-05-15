package com.fifa2026.prode.dto;

import com.fifa2026.prode.entity.Match;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchDTO {
    private Long id;
    private TeamDTO homeTeam;
    private TeamDTO awayTeam;
    private String homePlaceholder;
    private String awayPlaceholder;
    private LocalDateTime matchDate;
    private String venue;
    private String city;
    private String stage;
    private String groupLetter;
    private Integer matchNumber;
    private Integer homeScore;
    private Integer awayScore;
    private Integer homePenaltyScore;
    private Integer awayPenaltyScore;
    private TeamDTO winnerTeam;
    private String status;
    private boolean locked;
    private boolean teamsConfirmed;

    public static MatchDTO fromEntity(Match match) {
        return MatchDTO.builder()
                .id(match.getId())
                .homeTeam(match.getHomeTeam() != null ? TeamDTO.fromEntity(match.getHomeTeam()) : null)
                .awayTeam(match.getAwayTeam() != null ? TeamDTO.fromEntity(match.getAwayTeam()) : null)
                .homePlaceholder(match.getHomePlaceholder())
                .awayPlaceholder(match.getAwayPlaceholder())
                .matchDate(match.getMatchDate())
                .venue(match.getVenue())
                .city(match.getCity())
                .stage(match.getStage().name())
                .groupLetter(match.getGroupLetter())
                .matchNumber(match.getMatchNumber())
                .homeScore(match.getHomeScore())
                .awayScore(match.getAwayScore())
                .homePenaltyScore(match.getHomePenaltyScore())
                .awayPenaltyScore(match.getAwayPenaltyScore())
                .winnerTeam(match.getWinnerTeam() != null ? TeamDTO.fromEntity(match.getWinnerTeam()) : null)
                .status(match.getStatus().name())
                .locked(match.isLocked())
                .teamsConfirmed(match.getHomeTeam() != null && match.getAwayTeam() != null)
                .build();
    }
}
