package com.fifa2026.prode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bonus_predictions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "prediction_type"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BonusPrediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "prediction_type", nullable = false)
    private BonusType predictionType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "selected_team_id")
    private Team selectedTeam;

    private String selectedPlayerName;

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

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BonusType {
        CHAMPION,
        RUNNER_UP,
        THIRD_PLACE,
        TOP_SCORER
    }
}
