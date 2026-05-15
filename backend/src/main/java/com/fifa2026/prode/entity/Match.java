package com.fifa2026.prode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "home_team_id")
    private Team homeTeam;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "away_team_id")
    private Team awayTeam;

    // Placeholder text for knockout matches before teams are determined
    // e.g., "1A" (1st in Group A), "2B" (2nd in Group B), "W49" (Winner of Match 49)
    private String homePlaceholder;
    private String awayPlaceholder;

    @Column(nullable = false)
    private LocalDateTime matchDate;

    private String venue;

    private String city;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Stage stage;

    @Column(name = "group_letter", length = 1)
    private String groupLetter;

    private Integer matchNumber;

    // External API ID for syncing with Football-Data.org
    @Column(unique = true)
    private Long externalApiId;

    private Integer homeScore;

    private Integer awayScore;

    private Integer homePenaltyScore;

    private Integer awayPenaltyScore;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "winner_team_id")
    private Team winnerTeam;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = MatchStatus.SCHEDULED;
        }
    }

    public boolean isLocked() {
        return LocalDateTime.now().isAfter(matchDate);
    }

    public enum Stage {
        GROUP, ROUND_OF_32, ROUND_OF_16, QUARTERFINAL, SEMIFINAL, THIRD_PLACE, FINAL
    }

    public enum MatchStatus {
        SCHEDULED, LIVE, FINISHED, POSTPONED, CANCELLED
    }
}
