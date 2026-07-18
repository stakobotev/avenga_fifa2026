package com.fifa2026.prode.service;

import com.fifa2026.prode.dto.BonusAwardResult;
import com.fifa2026.prode.dto.BonusPredictionDTO;
import com.fifa2026.prode.dto.BonusPredictionRequest;
import com.fifa2026.prode.dto.PredictionDTO;
import com.fifa2026.prode.dto.PredictionRequest;
import com.fifa2026.prode.dto.TopScorerAwardResult;
import com.fifa2026.prode.entity.*;
import com.fifa2026.prode.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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

        Optional<Prediction> existing = predictionRepository.findByUserAndMatch(user, match);
        Prediction prediction = existing.orElseGet(Prediction::new);

        prediction.setUser(user);
        prediction.setMatch(match);
        prediction.setPredictedHomeScore(request.getPredictedHomeScore());
        prediction.setPredictedAwayScore(request.getPredictedAwayScore());
        prediction.setPredictedAdvancingTeam(advancingTeam);

        if (existing.isPresent()) {
            prediction.setUpdatedAt(LocalDateTime.now());
        }

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

        if (firstMatch != null && Instant.now().isAfter(firstMatch.getMatchDate())) {
            throw new RuntimeException("Bonus predictions are locked after tournament start");
        }

        Team selectedTeam = null;
        if (request.getSelectedTeamId() != null) {
            selectedTeam = teamRepository.findById(request.getSelectedTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
        }

        Optional<BonusPrediction> existing = bonusPredictionRepository.findByUserAndPredictionType(user, type);
        BonusPrediction prediction = existing.orElseGet(BonusPrediction::new);

        prediction.setUser(user);
        prediction.setPredictionType(type);
        prediction.setSelectedTeam(selectedTeam);
        prediction.setSelectedPlayerName(request.getSelectedPlayerName());

        if (existing.isPresent()) {
            prediction.setUpdatedAt(LocalDateTime.now());
        }

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

    /**
     * Settle the TOP_SCORER bonus against the given winning player name.
     * Predictions matching the name (accent- and case-insensitive) are awarded
     * the bonus points; every TOP_SCORER prediction is marked scored.
     *
     * This is ADDITIVE: non-matching predictions keep whatever points they
     * already have, so awarding a second top scorer never zeroes out users who
     * were already awarded for a different one (a competition can have more than
     * one top scorer, e.g. two players tied on goals). Re-running with the same
     * name is idempotent. To clear everything, use {@link #resetTopScorerBonus()}.
     */
    @Transactional
    public TopScorerAwardResult awardTopScorerBonus(String winningPlayerName) {
        if (winningPlayerName == null || winningPlayerName.isBlank()) {
            throw new RuntimeException("Winning player name is required");
        }

        String target = normalizeName(winningPlayerName);
        int points = scoringService.calculateBonusPoints(BonusPrediction.BonusType.TOP_SCORER);

        List<BonusPrediction> predictions =
                bonusPredictionRepository.findByPredictionType(BonusPrediction.BonusType.TOP_SCORER);

        int matched = 0;
        for (BonusPrediction bp : predictions) {
            boolean isMatch = target.equals(normalizeName(bp.getSelectedPlayerName()));
            if (isMatch) {
                bp.setPointsEarned(points);
                matched++;
            }
            // Non-matching picks are left untouched so a previously-awarded
            // co-top-scorer isn't reset to zero.
            bp.setScored(true);
            bonusPredictionRepository.save(bp);
        }

        return new TopScorerAwardResult(winningPlayerName.trim(), matched, predictions.size(), points);
    }

    /**
     * Undo the TOP_SCORER settlement entirely: every TOP_SCORER prediction goes
     * back to unscored with zero points, as if no top scorer had been awarded.
     * Users keep their picks. Returns how many predictions were reset.
     */
    @Transactional
    public int resetTopScorerBonus() {
        List<BonusPrediction> predictions =
                bonusPredictionRepository.findByPredictionType(BonusPrediction.BonusType.TOP_SCORER);
        for (BonusPrediction bp : predictions) {
            bp.setPointsEarned(0);
            bp.setScored(false);
            bonusPredictionRepository.save(bp);
        }
        return predictions.size();
    }

    /**
     * Settle a team-based bonus (CHAMPION, RUNNER_UP or THIRD_PLACE) against the
     * given team. Every prediction of that type is marked scored; those that
     * picked the team are awarded the bonus points, the rest get zero. Re-running
     * with a different team simply re-settles, so a correction is safe.
     */
    @Transactional
    public BonusAwardResult awardTeamBonus(BonusPrediction.BonusType type, Long teamId) {
        if (type == BonusPrediction.BonusType.TOP_SCORER) {
            throw new RuntimeException("Use the top-scorer award for the TOP_SCORER bonus");
        }
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        int points = scoringService.calculateBonusPoints(type);
        List<BonusPrediction> predictions = bonusPredictionRepository.findByPredictionType(type);

        int matched = 0;
        for (BonusPrediction bp : predictions) {
            boolean isMatch = bp.getSelectedTeam() != null
                    && bp.getSelectedTeam().getId().equals(teamId);
            bp.setPointsEarned(isMatch ? points : 0);
            bp.setScored(true);
            bonusPredictionRepository.save(bp);
            if (isMatch) {
                matched++;
            }
        }

        return new BonusAwardResult(type.name(), team.getName(), matched, predictions.size(), points);
    }

    /** Lowercase, trim, collapse spaces, and strip accents for lenient name comparison. */
    private String normalizeName(String name) {
        if (name == null) {
            return "";
        }
        String stripped = java.text.Normalizer.normalize(name, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return stripped.toLowerCase().trim().replaceAll("\\s+", " ");
    }
}
