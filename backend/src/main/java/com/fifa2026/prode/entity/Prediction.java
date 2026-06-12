package com.fifa2026.prode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "match_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @Column(nullable = false)
    private Integer predictedHomeScore;

    @Column(nullable = false)
    private Integer predictedAwayScore;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "predicted_advancing_team_id")
    private Team predictedAdvancingTeam;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Integer pointsEarned;

    private boolean scored;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        scored = false;
    }
}
