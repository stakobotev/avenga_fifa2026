package com.fifa2026.prode.service;

import com.fifa2026.prode.dto.MatchDTO;
import com.fifa2026.prode.dto.MatchResultRequest;
import com.fifa2026.prode.entity.Match;
import com.fifa2026.prode.entity.Team;
import com.fifa2026.prode.repository.MatchRepository;
import com.fifa2026.prode.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final PredictionService predictionService;

    public List<MatchDTO> getAllMatches() {
        return matchRepository.findAllByOrderByMatchDateAsc().stream()
                .map(MatchDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public MatchDTO getMatchById(Long id) {
        return matchRepository.findById(id)
                .map(MatchDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Match not found"));
    }

    public List<MatchDTO> getMatchesByStage(String stage) {
        Match.Stage matchStage = Match.Stage.valueOf(stage.toUpperCase());
        return matchRepository.findByStageOrderByMatchDateAsc(matchStage).stream()
                .map(MatchDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<MatchDTO> getMatchesByGroup(String groupLetter) {
        return matchRepository.findByGroupLetterOrderByMatchDateAsc(groupLetter.toUpperCase()).stream()
                .map(MatchDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<MatchDTO> getUpcomingMatches() {
        return matchRepository.findUpcomingMatches(Instant.now()).stream()
                .map(MatchDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<MatchDTO> getTodayMatches() {
        // Get today's matches in UTC
        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endOfDay = startOfDay.plusSeconds(24 * 60 * 60);
        return matchRepository.findByMatchDateBetweenOrderByMatchDateAsc(startOfDay, endOfDay).stream()
                .map(MatchDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Map<String, List<MatchDTO>> getMatchesGroupedByStage() {
        List<Match> matches = matchRepository.findAllByOrderByMatchDateAsc();
        return matches.stream()
                .map(MatchDTO::fromEntity)
                .collect(Collectors.groupingBy(MatchDTO::getStage));
    }

    @Transactional
    public MatchDTO updateMatchResult(Long matchId, MatchResultRequest request) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        match.setHomeScore(request.getHomeScore());
        match.setAwayScore(request.getAwayScore());
        match.setHomePenaltyScore(request.getHomePenaltyScore());
        match.setAwayPenaltyScore(request.getAwayPenaltyScore());
        match.setStatus(Match.MatchStatus.FINISHED);

        // Set winner for knockout matches
        if (match.getStage() != Match.Stage.GROUP) {
            if (request.getWinnerTeamId() != null) {
                Team winner = teamRepository.findById(request.getWinnerTeamId())
                        .orElseThrow(() -> new RuntimeException("Winner team not found"));
                match.setWinnerTeam(winner);
            } else {
                // Determine winner from score if no penalties
                if (request.getHomeScore() > request.getAwayScore()) {
                    match.setWinnerTeam(match.getHomeTeam());
                } else if (request.getAwayScore() > request.getHomeScore()) {
                    match.setWinnerTeam(match.getAwayTeam());
                } else if (request.getHomePenaltyScore() != null && request.getAwayPenaltyScore() != null) {
                    // Penalties
                    if (request.getHomePenaltyScore() > request.getAwayPenaltyScore()) {
                        match.setWinnerTeam(match.getHomeTeam());
                    } else {
                        match.setWinnerTeam(match.getAwayTeam());
                    }
                }
            }
        }

        match = matchRepository.save(match);

        // Score predictions for this match
        predictionService.scorePredictionsForMatch(match);

        return MatchDTO.fromEntity(match);
    }

    @Transactional
    public MatchDTO updateMatchTeams(Long matchId, Long homeTeamId, Long awayTeamId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        if (match.getStage() == Match.Stage.GROUP) {
            throw new RuntimeException("Cannot change teams for group-stage matches");
        }
        if (match.getStatus() == Match.MatchStatus.FINISHED) {
            throw new RuntimeException("Cannot change teams for a finished match");
        }

        // PATCH semantics: only the sides provided are updated; a null side is left as-is.
        Team home = match.getHomeTeam();
        Team away = match.getAwayTeam();

        if (homeTeamId != null) {
            home = teamRepository.findById(homeTeamId)
                    .orElseThrow(() -> new RuntimeException("Home team not found"));
        }
        if (awayTeamId != null) {
            away = teamRepository.findById(awayTeamId)
                    .orElseThrow(() -> new RuntimeException("Away team not found"));
        }

        if (home != null && away != null && home.getId().equals(away.getId())) {
            throw new RuntimeException("Home and away teams must be different");
        }

        match.setHomeTeam(home);
        match.setAwayTeam(away);
        match = matchRepository.save(match);
        return MatchDTO.fromEntity(match);
    }

    @Transactional
    public MatchDTO updateMatchDate(Long matchId, Instant newDate) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
        match.setMatchDate(newDate);
        match = matchRepository.save(match);
        return MatchDTO.fromEntity(match);
    }

    @Transactional
    public MatchDTO resetMatch(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
        match.setHomeScore(null);
        match.setAwayScore(null);
        match.setHomePenaltyScore(null);
        match.setAwayPenaltyScore(null);
        match.setWinnerTeam(null);
        match.setStatus(Match.MatchStatus.SCHEDULED);
        match = matchRepository.save(match);

        // Reset scored predictions for this match
        predictionService.resetPredictionsForMatch(match);

        return MatchDTO.fromEntity(match);
    }

    @Transactional
    public MatchDTO createMatch(MatchDTO matchDTO) {
        Team homeTeam = teamRepository.findById(matchDTO.getHomeTeam().getId())
                .orElseThrow(() -> new RuntimeException("Home team not found"));
        Team awayTeam = teamRepository.findById(matchDTO.getAwayTeam().getId())
                .orElseThrow(() -> new RuntimeException("Away team not found"));

        Match match = Match.builder()
                .homeTeam(homeTeam)
                .awayTeam(awayTeam)
                .matchDate(matchDTO.getMatchDate())
                .venue(matchDTO.getVenue())
                .city(matchDTO.getCity())
                .stage(Match.Stage.valueOf(matchDTO.getStage()))
                .groupLetter(matchDTO.getGroupLetter())
                .matchNumber(matchDTO.getMatchNumber())
                .status(Match.MatchStatus.SCHEDULED)
                .build();

        match = matchRepository.save(match);
        return MatchDTO.fromEntity(match);
    }
}
