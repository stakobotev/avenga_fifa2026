package com.fifa2026.prode.repository;

import com.fifa2026.prode.entity.BonusPrediction;
import com.fifa2026.prode.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BonusPredictionRepository extends JpaRepository<BonusPrediction, Long> {
    Optional<BonusPrediction> findByUserAndPredictionType(User user, BonusPrediction.BonusType predictionType);

    List<BonusPrediction> findByUser(User user);

    List<BonusPrediction> findByPredictionType(BonusPrediction.BonusType predictionType);

    @Query("SELECT COALESCE(SUM(bp.pointsEarned), 0) FROM BonusPrediction bp WHERE bp.user = :user")
    Integer getTotalBonusPointsForUser(@Param("user") User user);

    boolean existsByUserAndPredictionType(User user, BonusPrediction.BonusType predictionType);
}
