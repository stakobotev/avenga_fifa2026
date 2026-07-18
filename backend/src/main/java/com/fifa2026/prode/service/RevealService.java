package com.fifa2026.prode.service;

import com.fifa2026.prode.dto.RevealEnvelopeDTO;
import com.fifa2026.prode.dto.RevealTeaserDTO;
import com.fifa2026.prode.entity.BonusPrediction;
import com.fifa2026.prode.entity.Match;
import com.fifa2026.prode.entity.Team;
import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.repository.BonusPredictionRepository;
import com.fifa2026.prode.repository.MatchRepository;
import com.fifa2026.prode.repository.PredictionRepository;
import com.fifa2026.prode.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds the spoiler-free teaser and personal "sealed envelope" for the
 * results countdown. Nothing here exposes rankings or standings.
 */
@Service
@RequiredArgsConstructor
public class RevealService {

    private final UserRepository userRepository;
    private final PredictionRepository predictionRepository;
    private final BonusPredictionRepository bonusPredictionRepository;
    private final MatchRepository matchRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public RevealTeaserDTO getTeaser() {
        long matchesPlayed = matchRepository
                .findByStatusOrderByMatchDateAsc(Match.MatchStatus.FINISHED).size();

        TeamPick champ = topTeamPick(BonusPrediction.BonusType.CHAMPION);
        PlayerPick scorer = topPlayerPick();

        return RevealTeaserDTO.builder()
                .totalPlayers(userRepository.count())
                .totalPredictions(predictionRepository.count())
                .totalBonusPredictions(bonusPredictionRepository.count())
                .matchesPlayed(matchesPlayed)
                .favoriteChampionCode(champ != null ? champ.code : null)
                .favoriteChampionName(champ != null ? champ.name : null)
                .favoriteChampionVotes(champ != null ? champ.votes : 0)
                .favoriteTopScorer(scorer != null ? scorer.name : null)
                .favoriteTopScorerVotes(scorer != null ? scorer.votes : 0)
                .build();
    }

    @Transactional(readOnly = true)
    public RevealEnvelopeDTO getMyEnvelope() {
        User user = currentUserService.getCurrentUser();
        return RevealEnvelopeDTO.builder()
                .displayName(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername())
                .region(user.getRegion() != null ? user.getRegion().getDisplayName() : null)
                .predictionsMade(predictionRepository.findByUser(user).size())
                .bonusPredictionsMade(bonusPredictionRepository.findByUser(user).size())
                .exactScores(predictionRepository.getExactScoreCountForUser(user))
                .build();
    }

    // --- helpers ---

    private TeamPick topTeamPick(BonusPrediction.BonusType type) {
        Map<Long, Long> counts = new LinkedHashMap<>();
        Map<Long, Team> teams = new LinkedHashMap<>();
        for (BonusPrediction bp : bonusPredictionRepository.findByPredictionType(type)) {
            Team team = bp.getSelectedTeam();
            if (team == null) continue;
            counts.merge(team.getId(), 1L, Long::sum);
            teams.putIfAbsent(team.getId(), team);
        }
        Long bestId = null;
        long best = 0;
        for (Map.Entry<Long, Long> e : counts.entrySet()) {
            if (e.getValue() > best) {
                best = e.getValue();
                bestId = e.getKey();
            }
        }
        if (bestId == null) return null;
        Team t = teams.get(bestId);
        return new TeamPick(t.getCode(), t.getName(), best);
    }

    private PlayerPick topPlayerPick() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (BonusPrediction bp : bonusPredictionRepository
                .findByPredictionType(BonusPrediction.BonusType.TOP_SCORER)) {
            String name = bp.getSelectedPlayerName();
            if (name == null || name.isBlank()) continue;
            counts.merge(name.trim(), 1L, Long::sum);
        }
        String bestName = null;
        long best = 0;
        for (Map.Entry<String, Long> e : counts.entrySet()) {
            if (e.getValue() > best) {
                best = e.getValue();
                bestName = e.getKey();
            }
        }
        return bestName == null ? null : new PlayerPick(bestName, best);
    }

    private record TeamPick(String code, String name, long votes) {}

    private record PlayerPick(String name, long votes) {}
}
