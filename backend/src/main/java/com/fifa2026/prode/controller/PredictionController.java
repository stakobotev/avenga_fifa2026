package com.fifa2026.prode.controller;

import com.fifa2026.prode.dto.BonusPredictionDTO;
import com.fifa2026.prode.dto.BonusPredictionRequest;
import com.fifa2026.prode.dto.PredictionDTO;
import com.fifa2026.prode.dto.PredictionRequest;
import com.fifa2026.prode.dto.TopScorerAwardResult;
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

    @PostMapping("/bonus/award-top-scorer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TopScorerAwardResult> awardTopScorer(@RequestBody Map<String, String> request) {
        String playerName = request.get("playerName");
        return ResponseEntity.ok(predictionService.awardTopScorerBonus(playerName));
    }
}
