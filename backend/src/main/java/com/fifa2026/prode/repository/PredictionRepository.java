package com.fifa2026.prode.repository;

import com.fifa2026.prode.entity.Match;
import com.fifa2026.prode.entity.Prediction;
import com.fifa2026.prode.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    Optional<Prediction> findByUserAndMatch(User user, Match match);

    List<Prediction> findByUser(User user);

    List<Prediction> findByMatch(Match match);

    List<Prediction> findByUserAndScoredFalse(User user);

    @Query("SELECT p FROM Prediction p WHERE p.match = :match AND p.scored = false")
    List<Prediction> findUnscoredPredictionsForMatch(@Param("match") Match match);

    @Query("SELECT COALESCE(SUM(p.pointsEarned), 0) FROM Prediction p WHERE p.user = :user")
    Integer getTotalPointsForUser(@Param("user") User user);

    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.user = :user AND p.pointsEarned = 5")
    Integer getExactScoreCountForUser(@Param("user") User user);

    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.user = :user AND p.pointsEarned > 0")
    Integer getCorrectPredictionCountForUser(@Param("user") User user);

    boolean existsByUserAndMatch(User user, Match match);
}
