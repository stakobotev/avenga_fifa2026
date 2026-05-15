package com.fifa2026.prode.service;

import com.fifa2026.prode.dto.BonusPredictionDTO;
import com.fifa2026.prode.dto.BonusPredictionRequest;
import com.fifa2026.prode.dto.PredictionDTO;
import com.fifa2026.prode.dto.PredictionRequest;
import com.fifa2026.prode.entity.*;
import com.fifa2026.prode.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final BonusPredictionRepository bonusPredictionRepository;
    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final ScoringService scoringService;

    @Transactional
    public PredictionDTO createOrUpdatePrediction(Long userId, PredictionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Match match = matchRepository.findById(request.getMatchId())
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (match.isLocked()) {
            throw new RuntimeException("Predictions for this match are locked");
        }

        // Check if teams are confirmed (for knockout matches)
        if (match.getHomeTeam() == null || match.getAwayTeam() == null) {
            throw new RuntimeException("Teams are not yet confirmed for this match");
        }

        Team advancingTeam = null;
        if (request.getPredictedAdvancingTeamId() != null) {
            advancingTeam = teamRepository.findById(request.getPredictedAdvancingTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));

            // Validate advancing team is one of the match teams
            if (!advancingTeam.getId().equals(match.getHomeTeam().getId()) &&
                !advancingTeam.getId().equals(match.getAwayTeam().getId())) {
                throw new RuntimeException("Advancing team must be one of the match teams");
            }
        }

        // For knockout matches, advancing team is required
        if (match.getStage() != Match.Stage.GROUP && advancingTeam == null) {
            throw new RuntimeException("Advancing team prediction is required for knockout matches");
        }

        Prediction prediction = predictionRepository.findByUserAndMatch(user, match)
                .orElse(new Prediction());

        prediction.setUser(user);
        prediction.setMatch(match);
        prediction.setPredictedHomeScore(request.getPredictedHomeScore());
        prediction.setPredictedAwayScore(request.getPredictedAwayScore());
        prediction.setPredictedAdvancingTeam(advancingTeam);

        prediction = predictionRepository.save(prediction);

        return PredictionDTO.fromEntity(prediction);
    }

    public List<PredictionDTO> getUserPredictions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return predictionRepository.findByUser(user).stream()
                .map(PredictionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public PredictionDTO getUserPredictionForMatch(Long userId, Long matchId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        return predictionRepository.findByUserAndMatch(user, match)
                .map(PredictionDTO::fromEntity)
                .orElse(null);
    }

    @Transactional
    public BonusPredictionDTO createOrUpdateBonusPrediction(Long userId, BonusPredictionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BonusPrediction.BonusType type;
        try {
            type = BonusPrediction.BonusType.valueOf(request.getPredictionType());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid prediction type");
        }

        // Check if tournament has started (first match date)
        Match firstMatch = matchRepository.findAllByOrderByMatchDateAsc().stream()
                .findFirst()
                .orElse(null);

        if (firstMatch != null && LocalDateTime.now().isAfter(firstMatch.getMatchDate())) {
            throw new RuntimeException("Bonus predictions are locked after tournament start");
        }

        Team selectedTeam = null;
        if (request.getSelectedTeamId() != null) {
            selectedTeam = teamRepository.findById(request.getSelectedTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
        }

        BonusPrediction prediction = bonusPredictionRepository.findByUserAndPredictionType(user, type)
                .orElse(new BonusPrediction());

        prediction.setUser(user);
        prediction.setPredictionType(type);
        prediction.setSelectedTeam(selectedTeam);
        prediction.setSelectedPlayerName(request.getSelectedPlayerName());

        prediction = bonusPredictionRepository.save(prediction);

        return BonusPredictionDTO.fromEntity(prediction);
    }

    public List<BonusPredictionDTO> getUserBonusPredictions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bonusPredictionRepository.findByUser(user).stream()
                .map(BonusPredictionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void scorePredictionsForMatch(Match match) {
        List<Prediction> predictions = predictionRepository.findUnscoredPredictionsForMatch(match);

        for (Prediction prediction : predictions) {
            int points = scoringService.calculateMatchPredictionPoints(prediction, match);
            prediction.setPointsEarned(points);
            prediction.setScored(true);
            predictionRepository.save(prediction);
        }
    }

    @Transactional
    public void resetPredictionsForMatch(Match match) {
        List<Prediction> predictions = predictionRepository.findByMatch(match);

        for (Prediction prediction : predictions) {
            prediction.setPointsEarned(0);
            prediction.setScored(false);
            predictionRepository.save(prediction);
        }
    }
}
