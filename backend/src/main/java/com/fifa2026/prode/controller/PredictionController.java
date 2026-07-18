package com.fifa2026.prode.controller;

import com.fifa2026.prode.dto.BonusAwardResult;
import com.fifa2026.prode.dto.BonusPredictionDTO;
import com.fifa2026.prode.dto.BonusPredictionRequest;
import com.fifa2026.prode.dto.PredictionDTO;
import com.fifa2026.prode.dto.PredictionRequest;
import com.fifa2026.prode.dto.TopScorerAwardResult;
import com.fifa2026.prode.entity.BonusPrediction;
import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.service.CurrentUserService;
import com.fifa2026.prode.service.PredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<PredictionDTO> createPrediction(
            @Valid @RequestBody PredictionRequest request) {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(predictionService.createOrUpdatePrediction(user.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<PredictionDTO>> getMyPredictions() {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(predictionService.getUserPredictions(user.getId()));
    }

    @GetMapping("/match/{matchId}")
    public ResponseEntity<PredictionDTO> getMyPredictionForMatch(@PathVariable Long matchId) {
        User user = currentUserService.getCurrentUser();
        PredictionDTO prediction = predictionService.getUserPredictionForMatch(user.getId(), matchId);
        return prediction != null ? ResponseEntity.ok(prediction) : ResponseEntity.notFound().build();
    }

    @PostMapping("/bonus")
    public ResponseEntity<BonusPredictionDTO> createBonusPrediction(
            @Valid @RequestBody BonusPredictionRequest request) {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(predictionService.createOrUpdateBonusPrediction(user.getId(), request));
    }

    @GetMapping("/bonus")
    public ResponseEntity<List<BonusPredictionDTO>> getMyBonusPredictions() {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(predictionService.getUserBonusPredictions(user.getId()));
    }

    // Admin-only: inspect another user's predictions (e.g. from the leaderboard).
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PredictionDTO>> getUserPredictions(@PathVariable Long userId) {
        return ResponseEntity.ok(predictionService.getUserPredictions(userId));
    }

    @GetMapping("/bonus/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BonusPredictionDTO>> getUserBonusPredictions(@PathVariable Long userId) {
        return ResponseEntity.ok(predictionService.getUserBonusPredictions(userId));
    }

    @PostMapping("/bonus/award-top-scorer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TopScorerAwardResult> awardTopScorer(@RequestBody Map<String, String> request) {
        String playerName = request.get("playerName");
        return ResponseEntity.ok(predictionService.awardTopScorerBonus(playerName));
    }

    @PostMapping("/bonus/reset-top-scorer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> resetTopScorer() {
        int reset = predictionService.resetTopScorerBonus();
        return ResponseEntity.ok(Map.of("reset", reset));
    }

    @PostMapping("/bonus/award-team")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BonusAwardResult> awardTeamBonus(@RequestBody Map<String, String> request) {
        BonusPrediction.BonusType type;
        try {
            type = BonusPrediction.BonusType.valueOf(request.get("predictionType"));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new RuntimeException("Invalid prediction type");
        }
        Long teamId;
        try {
            teamId = Long.valueOf(request.get("teamId"));
        } catch (NumberFormatException | NullPointerException e) {
            throw new RuntimeException("A valid teamId is required");
        }
        return ResponseEntity.ok(predictionService.awardTeamBonus(type, teamId));
    }
}
