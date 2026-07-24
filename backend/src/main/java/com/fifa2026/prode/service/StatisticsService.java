package com.fifa2026.prode.service;

import com.fifa2026.prode.dto.MatchPredictionBreakdownDTO;
import com.fifa2026.prode.dto.StatisticsOverviewDTO;
import com.fifa2026.prode.dto.StatisticsOverviewDTO.*;
import com.fifa2026.prode.dto.TeamDTO;
import com.fifa2026.prode.entity.BonusPrediction;
import com.fifa2026.prode.entity.Match;
import com.fifa2026.prode.entity.Prediction;
import com.fifa2026.prode.entity.Team;
import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.repository.BonusPredictionRepository;
import com.fifa2026.prode.repository.MatchRepository;
import com.fifa2026.prode.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final PredictionRepository predictionRepository;
    private final BonusPredictionRepository bonusPredictionRepository;
    private final MatchRepository matchRepository;
    private final ScoringService scoringService;

    @Transactional(readOnly = true)
    public StatisticsOverviewDTO getOverview() {
        List<Prediction> predictions = predictionRepository.findAllForFinishedMatches();

        return StatisticsOverviewDTO.builder()
                .totalUsers(countDistinctUsers(predictions))
                .totalPredictions(predictions.size())
                .exactScore(predictions.stream().filter(this::isExact).count())
                .onlyWinner(predictions.stream().filter(p -> isCorrectResult(p) && !isExact(p)).count())
                .topScorers(topScorerStats())
                .champion(teamStats(BonusPrediction.BonusType.CHAMPION))
                .runnerUp(teamStats(BonusPrediction.BonusType.RUNNER_UP))
                .thirdPlace(teamStats(BonusPrediction.BonusType.THIRD_PLACE))
                .bonusResults(bonusResults())
                .regions(regionStats(predictions))
                .regionsTotal(regionTotal(predictions))
                .matches(matchAccuracy(predictions))
                .build();
    }

    // --- Summary helpers ---

    private long countDistinctUsers(List<Prediction> predictions) {
        Set<Long> ids = new HashSet<>();
        for (Prediction p : predictions) {
            ids.add(p.getUser().getId());
        }
        return ids.size();
    }

    // --- Bonus survey ---

    private List<PlayerStat> topScorerStats() {
        List<BonusPrediction> picks = bonusPredictionRepository
                .findByPredictionType(BonusPrediction.BonusType.TOP_SCORER);

        Map<String, Long> counts = new LinkedHashMap<>();
        for (BonusPrediction bp : picks) {
            String name = bp.getSelectedPlayerName();
            if (name == null || name.isBlank()) continue;
            counts.merge(name, 1L, Long::sum);
        }

        long total = counts.values().stream().mapToLong(Long::longValue).sum();
        List<PlayerStat> result = new ArrayList<>();
        for (Map.Entry<String, Long> e : counts.entrySet()) {
            result.add(PlayerStat.builder()
                    .name(e.getKey())
                    .count(e.getValue())
                    .pct(pct(e.getValue(), total))
                    .build());
        }
        result.sort(Comparator.comparingLong(PlayerStat::getCount).reversed()
                .thenComparing(PlayerStat::getName));
        return result;
    }

    private List<TeamStat> teamStats(BonusPrediction.BonusType type) {
        List<BonusPrediction> picks = bonusPredictionRepository.findByPredictionType(type);

        Map<Long, Long> counts = new LinkedHashMap<>();
        Map<Long, Team> teams = new LinkedHashMap<>();
        for (BonusPrediction bp : picks) {
            Team team = bp.getSelectedTeam();
            if (team == null) continue;
            counts.merge(team.getId(), 1L, Long::sum);
            teams.putIfAbsent(team.getId(), team);
        }

        long total = counts.values().stream().mapToLong(Long::longValue).sum();
        List<TeamStat> result = new ArrayList<>();
        for (Map.Entry<Long, Long> e : counts.entrySet()) {
            Team team = teams.get(e.getKey());
            result.add(TeamStat.builder()
                    .code(team.getCode())
                    .name(team.getName())
                    .flagUrl(team.getFlagUrl())
                    .count(e.getValue())
                    .pct(pct(e.getValue(), total))
                    .build());
        }
        result.sort(Comparator.comparingLong(TeamStat::getCount).reversed()
                .thenComparing(TeamStat::getName));
        return result;
    }

    // --- Actual bonus outcomes (final results) ---

    private List<BonusResult> bonusResults() {
        Team champion = null, runnerUp = null, third = null;

        Match finalMatch = lastByStage(Match.Stage.FINAL);
        if (finalMatch != null && finalMatch.getWinnerTeam() != null) {
            champion = finalMatch.getWinnerTeam();
            runnerUp = otherTeam(finalMatch, champion);
        }
        Match thirdMatch = lastByStage(Match.Stage.THIRD_PLACE);
        if (thirdMatch != null && thirdMatch.getWinnerTeam() != null) {
            third = thirdMatch.getWinnerTeam();
        }

        List<BonusResult> out = new ArrayList<>();
        out.add(teamBonusResult(BonusPrediction.BonusType.CHAMPION, "Champion", champion));
        out.add(teamBonusResult(BonusPrediction.BonusType.RUNNER_UP, "Runner-up", runnerUp));
        out.add(teamBonusResult(BonusPrediction.BonusType.THIRD_PLACE, "Third Place", third));
        out.add(topScorerBonusResult());
        return out;
    }

    private Match lastByStage(Match.Stage stage) {
        List<Match> ms = matchRepository.findByStageOrderByMatchDateAsc(stage);
        return ms.isEmpty() ? null : ms.get(ms.size() - 1);
    }

    private Team otherTeam(Match m, Team team) {
        if (m.getHomeTeam() != null && team != null && m.getHomeTeam().getId().equals(team.getId())) {
            return m.getAwayTeam();
        }
        return m.getHomeTeam();
    }

    private BonusResult teamBonusResult(BonusPrediction.BonusType type, String label, Team actual) {
        List<BonusPrediction> picks = bonusPredictionRepository.findByPredictionType(type);
        long total = picks.size();
        long correct = 0;
        if (actual != null) {
            for (BonusPrediction bp : picks) {
                if (bp.getSelectedTeam() != null && bp.getSelectedTeam().getId().equals(actual.getId())) {
                    correct++;
                }
            }
        }
        List<BonusWinner> winners = new ArrayList<>();
        if (actual != null) {
            winners.add(BonusWinner.builder()
                    .name(actual.getName())
                    .code(actual.getCode())
                    .flagUrl(actual.getFlagUrl())
                    .build());
        }
        return BonusResult.builder()
                .type(type.name())
                .label(label)
                .winners(winners)
                .correct(correct)
                .totalPicks(total)
                .pct(pct(correct, total))
                .pointsEach(scoringService.calculateBonusPoints(type))
                .settled(actual != null)
                .build();
    }

    private BonusResult topScorerBonusResult() {
        BonusPrediction.BonusType type = BonusPrediction.BonusType.TOP_SCORER;
        List<BonusPrediction> picks = bonusPredictionRepository.findByPredictionType(type);
        long total = picks.size();
        long correct = 0;
        // The actual top scorer(s) are whoever's picks were awarded points.
        Map<String, BonusWinner> winners = new LinkedHashMap<>();
        for (BonusPrediction bp : picks) {
            Integer pts = bp.getPointsEarned();
            if (pts != null && pts > 0) {
                correct++;
                String name = bp.getSelectedPlayerName();
                if (name != null && !name.isBlank()) {
                    winners.putIfAbsent(name.trim().toLowerCase(),
                            BonusWinner.builder().name(name.trim()).build());
                }
            }
        }
        return BonusResult.builder()
                .type(type.name())
                .label("Top Scorer")
                .winners(new ArrayList<>(winners.values()))
                .correct(correct)
                .totalPicks(total)
                .pct(pct(correct, total))
                .pointsEach(scoringService.calculateBonusPoints(type))
                .settled(!winners.isEmpty())
                .build();
    }

    // --- Regional breakdown ---

    private List<RegionStat> regionStats(List<Prediction> predictions) {
        long grandTotal = predictions.size();

        // Seed all regions so empty ones still appear.
        Map<User.Region, RegionAccumulator> acc = new LinkedHashMap<>();
        for (User.Region region : User.Region.values()) {
            acc.put(region, new RegionAccumulator());
        }

        for (Prediction p : predictions) {
            User.Region region = p.getUser().getRegion();
            if (region == null) region = User.Region.OTHER;
            RegionAccumulator a = acc.computeIfAbsent(region, r -> new RegionAccumulator());
            a.total++;
            a.users.add(p.getUser().getId());
            if (isExact(p)) {
                a.exact++;
            } else if (isCorrectResult(p)) {
                a.onlyWinner++;
            }
        }

        List<RegionStat> result = new ArrayList<>();
        for (Map.Entry<User.Region, RegionAccumulator> e : acc.entrySet()) {
            RegionAccumulator a = e.getValue();
            result.add(RegionStat.builder()
                    .region(e.getKey().name())
                    .regionDisplayName(e.getKey().getDisplayName())
                    .usersWithPredictions(a.users.size())
                    .totalPredictions(a.total)
                    .exactScore(a.exact)
                    .onlyWinner(a.onlyWinner)
                    .sharePct(pct(a.total, grandTotal))
                    .build());
        }
        result.sort(Comparator.comparingLong(RegionStat::getTotalPredictions).reversed()
                .thenComparing(RegionStat::getRegionDisplayName));
        return result;
    }

    private RegionStat regionTotal(List<Prediction> predictions) {
        long total = predictions.size();
        long exact = predictions.stream().filter(this::isExact).count();
        long onlyWinner = predictions.stream().filter(p -> isCorrectResult(p) && !isExact(p)).count();
        return RegionStat.builder()
                .region("TOTAL")
                .regionDisplayName("Total")
                .usersWithPredictions(countDistinctUsers(predictions))
                .totalPredictions(total)
                .exactScore(exact)
                .onlyWinner(onlyWinner)
                .sharePct(total == 0 ? 0.0 : 100.0)
                .build();
    }

    private static class RegionAccumulator {
        long total = 0;
        long exact = 0;
        long onlyWinner = 0;
        Set<Long> users = new HashSet<>();
    }

    // --- Per-match accuracy ---

    private List<MatchAccuracy> matchAccuracy(List<Prediction> predictions) {
        // Group predictions by match.
        Map<Long, List<Prediction>> byMatch = new LinkedHashMap<>();
        for (Prediction p : predictions) {
            byMatch.computeIfAbsent(p.getMatch().getId(), k -> new ArrayList<>()).add(p);
        }

        List<Match> finished = matchRepository
                .findByStatusOrderByMatchDateAsc(Match.MatchStatus.FINISHED);

        List<MatchAccuracy> result = new ArrayList<>();
        for (Match m : finished) {
            if (m.getHomeScore() == null || m.getAwayScore() == null) continue;

            List<Prediction> preds = byMatch.getOrDefault(m.getId(), List.of());
            long exact = preds.stream().filter(this::isExact).count();
            long correctWinner = preds.stream().filter(this::isCorrectResult).count();
            long count = preds.size();

            result.add(MatchAccuracy.builder()
                    .matchNumber(m.getMatchNumber())
                    .stage(m.getStage().name())
                    .homeTeam(TeamDTO.fromEntity(m.getHomeTeam()))
                    .awayTeam(TeamDTO.fromEntity(m.getAwayTeam()))
                    .homeScore(m.getHomeScore())
                    .awayScore(m.getAwayScore())
                    .predictions(count)
                    .exactScore(exact)
                    .exactPct(pct(exact, count))
                    .correctWinner(correctWinner)
                    .correctWinnerPct(pct(correctWinner, count))
                    .build());
        }
        return result;
    }

    /**
     * For a single finished match (by match number), list who predicted the exact
     * score and who predicted only the correct winner (correct result, not exact).
     */
    @Transactional(readOnly = true)
    public MatchPredictionBreakdownDTO getMatchPredictionBreakdown(Integer matchNumber) {
        Match match = matchRepository.findByMatchNumber(matchNumber)
                .orElseThrow(() -> new RuntimeException("Match not found"));

        List<MatchPredictionBreakdownDTO.Row> exact = new ArrayList<>();
        List<MatchPredictionBreakdownDTO.Row> winner = new ArrayList<>();

        if (match.getHomeScore() != null && match.getAwayScore() != null) {
            for (Prediction p : predictionRepository.findByMatch(match)) {
                if (isExact(p)) {
                    exact.add(toRow(p));
                } else if (isCorrectResult(p)) {
                    winner.add(toRow(p));
                }
            }
        }

        Comparator<MatchPredictionBreakdownDTO.Row> byName =
                Comparator.comparing(r -> r.getDisplayName() != null ? r.getDisplayName() : r.getUsername(),
                        String.CASE_INSENSITIVE_ORDER);
        exact.sort(byName);
        winner.sort(byName);

        return MatchPredictionBreakdownDTO.builder()
                .matchNumber(match.getMatchNumber())
                .stage(match.getStage().name())
                .homeTeam(TeamDTO.fromEntity(match.getHomeTeam()))
                .awayTeam(TeamDTO.fromEntity(match.getAwayTeam()))
                .homeScore(match.getHomeScore())
                .awayScore(match.getAwayScore())
                .exactScorers(exact)
                .winnerScorers(winner)
                .build();
    }

    private MatchPredictionBreakdownDTO.Row toRow(Prediction p) {
        User u = p.getUser();
        return MatchPredictionBreakdownDTO.Row.builder()
                .userId(u.getId())
                .displayName(u.getDisplayName())
                .username(u.getUsername())
                .region(u.getRegion().name())
                .regionDisplayName(u.getRegion().getDisplayName())
                .predictedHomeScore(p.getPredictedHomeScore())
                .predictedAwayScore(p.getPredictedAwayScore())
                .build();
    }

    // --- Scoring predicates (mirror ScoringService 1X2 semantics) ---

    private boolean isExact(Prediction p) {
        Match m = p.getMatch();
        if (m.getHomeScore() == null || m.getAwayScore() == null) return false;
        return p.getPredictedHomeScore().equals(m.getHomeScore())
                && p.getPredictedAwayScore().equals(m.getAwayScore());
    }

    private boolean isCorrectResult(Prediction p) {
        Match m = p.getMatch();
        if (m.getHomeScore() == null || m.getAwayScore() == null) return false;
        return result(p.getPredictedHomeScore(), p.getPredictedAwayScore())
                == result(m.getHomeScore(), m.getAwayScore());
    }

    private int result(int home, int away) {
        return Integer.compare(home, away); // -1 away win, 0 draw, 1 home win
    }

    private double pct(long part, long whole) {
        if (whole == 0) return 0.0;
        return Math.round((part * 1000.0) / whole) / 10.0; // one decimal place
    }
}
