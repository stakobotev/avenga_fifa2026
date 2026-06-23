package com.fifa2026.prode.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fifa2026.prode.dto.MatchResultCheckResponse;
import com.fifa2026.prode.dto.TopScorerDTO;
import com.fifa2026.prode.entity.Match;
import com.fifa2026.prode.entity.Team;
import com.fifa2026.prode.repository.MatchRepository;
import com.fifa2026.prode.repository.TeamRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FootballDataApiService {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final PredictionService predictionService;

    @Value("${football-data.api-key:}")
    private String apiKey;

    @Value("${football-data.competition-id:2000}")
    private String competitionId; // 2000 = FIFA World Cup

    @Value("${football-data.enabled:false}")
    private boolean enabled;

    private static final String BASE_URL = "https://api.football-data.org/v4";

    private WebClient webClient;

    private WebClient getWebClient() {
        if (webClient == null) {
            webClient = WebClient.builder()
                    .baseUrl(BASE_URL)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .defaultHeader("X-Auth-Token", apiKey)
                    .build();
        }
        return webClient;
    }

    public boolean isEnabled() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }

    /**
     * Fetches all matches from Football-Data.org for the configured competition
     */
    public MatchesResponse fetchMatches() {
        if (!isEnabled()) {
            log.warn("Football-Data API is not enabled or API key is missing");
            return null;
        }

        try {
            log.info("Fetching matches from Football-Data.org for competition {}", competitionId);
            return getWebClient()
                    .get()
                    .uri("/competitions/{competitionId}/matches", competitionId)
                    .retrieve()
                    .bodyToMono(MatchesResponse.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch matches from Football-Data.org: {} - {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            return null;
        } catch (Exception e) {
            log.error("Error fetching matches from Football-Data.org", e);
            return null;
        }
    }

    /**
     * Syncs match results from Football-Data.org to our database
     * Returns the number of matches updated
     */
    @Transactional
    public SyncResult syncMatchResults() {
        SyncResult result = new SyncResult();

        if (!isEnabled()) {
            result.setMessage("Football-Data API is not enabled");
            return result;
        }

        MatchesResponse response = fetchMatches();
        if (response == null || response.getMatches() == null) {
            result.setMessage("Failed to fetch matches from API");
            return result;
        }

        log.info("Fetched {} matches from Football-Data.org", response.getMatches().size());

        for (ApiMatch apiMatch : response.getMatches()) {
            try {
                if (processApiMatch(apiMatch)) {
                    result.incrementUpdated();
                }
                result.incrementProcessed();
            } catch (Exception e) {
                log.error("Error processing match {}: {}", apiMatch.getId(), e.getMessage());
                result.incrementErrors();
            }
        }

        result.setMessage(String.format("Sync completed: %d processed, %d updated, %d errors",
                result.getProcessed(), result.getUpdated(), result.getErrors()));
        log.info(result.getMessage());

        return result;
    }

    /**
     * Process a single match from the API
     * Returns true if the match was updated
     */
    private boolean processApiMatch(ApiMatch apiMatch) {
        // Only process finished matches
        if (!"FINISHED".equals(apiMatch.getStatus())) {
            return false;
        }

        // Try to find matching match in our database
        Match localMatch = findLocalMatch(apiMatch);
        if (localMatch == null) {
            log.debug("No matching local match found for API match {}", apiMatch.getId());
            return false;
        }

        // Skip if already finished
        if (localMatch.getStatus() == Match.MatchStatus.FINISHED) {
            return false;
        }

        // Update match result
        ApiScore score = apiMatch.getScore();
        if (score == null || score.getFullTime() == null) {
            return false;
        }

        Integer apiHome = score.getFullTime().getHome();
        Integer apiAway = score.getFullTime().getAway();

        if (apiHome == null || apiAway == null) {
            return false;
        }

        // Align API scores to our stored home/away orientation (knockout pairings
        // may be listed with the opposite home side).
        boolean swap = shouldSwapScores(localMatch, apiMatch);
        int homeScore = swap ? apiAway : apiHome;
        int awayScore = swap ? apiHome : apiAway;

        log.info("Updating match {} ({} vs {}) with result {}-{}{}",
                localMatch.getId(),
                localMatch.getHomeTeam().getCode(),
                localMatch.getAwayTeam().getCode(),
                homeScore, awayScore,
                swap ? " (orientation corrected)" : "");

        localMatch.setHomeScore(homeScore);
        localMatch.setAwayScore(awayScore);
        localMatch.setStatus(Match.MatchStatus.FINISHED);
        localMatch.setExternalApiId(apiMatch.getId());

        // Handle penalties for knockout matches (aligned to our orientation)
        if (score.getPenalties() != null &&
            score.getPenalties().getHome() != null &&
            score.getPenalties().getAway() != null) {
            int penHome = score.getPenalties().getHome();
            int penAway = score.getPenalties().getAway();
            localMatch.setHomePenaltyScore(swap ? penAway : penHome);
            localMatch.setAwayPenaltyScore(swap ? penHome : penAway);
        }

        // Determine winner for knockout matches
        if (localMatch.getStage() != Match.Stage.GROUP) {
            if (homeScore > awayScore) {
                localMatch.setWinnerTeam(localMatch.getHomeTeam());
            } else if (awayScore > homeScore) {
                localMatch.setWinnerTeam(localMatch.getAwayTeam());
            } else if (localMatch.getHomePenaltyScore() != null && localMatch.getAwayPenaltyScore() != null) {
                if (localMatch.getHomePenaltyScore() > localMatch.getAwayPenaltyScore()) {
                    localMatch.setWinnerTeam(localMatch.getHomeTeam());
                } else {
                    localMatch.setWinnerTeam(localMatch.getAwayTeam());
                }
            }
        }

        matchRepository.save(localMatch);

        // Score predictions for this match
        predictionService.scorePredictionsForMatch(localMatch);

        return true;
    }

    /**
     * Find local match that corresponds to the API match
     * First tries by external API ID, then by teams and date
     */
    private Match findLocalMatch(ApiMatch apiMatch) {
        // First, try to find by external API ID
        Optional<Match> byExternalId = matchRepository.findByExternalApiId(apiMatch.getId());
        if (byExternalId.isPresent()) {
            return byExternalId.get();
        }

        // Otherwise, try to match by teams
        if (apiMatch.getHomeTeam() == null || apiMatch.getAwayTeam() == null) {
            return null;
        }

        String homeTeamCode = mapApiTeamCode(apiMatch.getHomeTeam().getTla());
        String awayTeamCode = mapApiTeamCode(apiMatch.getAwayTeam().getTla());

        if (homeTeamCode == null || awayTeamCode == null) {
            return null;
        }

        Optional<Team> homeTeam = teamRepository.findByCode(homeTeamCode);
        Optional<Team> awayTeam = teamRepository.findByCode(awayTeamCode);

        if (homeTeam.isEmpty() || awayTeam.isEmpty()) {
            return null;
        }

        Long id1 = homeTeam.get().getId();
        Long id2 = awayTeam.get().getId();

        // Find match with these two teams. Match in EITHER orientation because
        // knockout pairings have no fixed home side, and skip matches whose teams
        // aren't assigned yet (knockout placeholders) to stay null-safe.
        for (Match match : matchRepository.findAllByOrderByMatchDateAsc()) {
            if (match.getHomeTeam() == null || match.getAwayTeam() == null) {
                continue;
            }
            Long mh = match.getHomeTeam().getId();
            Long ma = match.getAwayTeam().getId();
            if ((mh.equals(id1) && ma.equals(id2)) || (mh.equals(id2) && ma.equals(id1))) {
                return match;
            }
        }

        return null;
    }

    /**
     * True when the API lists this match's teams in the opposite home/away order
     * to how we stored it, so the API scores must be swapped to our orientation.
     */
    private boolean shouldSwapScores(Match localMatch, ApiMatch apiMatch) {
        if (apiMatch.getHomeTeam() == null
                || localMatch.getHomeTeam() == null
                || localMatch.getAwayTeam() == null) {
            return false;
        }
        String apiHomeCode = mapApiTeamCode(apiMatch.getHomeTeam().getTla());
        if (apiHomeCode == null) {
            return false;
        }
        return apiHomeCode.equals(localMatch.getAwayTeam().getCode())
                && !apiHomeCode.equals(localMatch.getHomeTeam().getCode());
    }

    /**
     * Map Football-Data.org team codes to our team codes if they differ
     */
    private String mapApiTeamCode(String apiCode) {
        if (apiCode == null) return null;

        // Football-Data.org uses different codes for some teams
        return switch (apiCode) {
            case "GBR" -> "ENG"; // England
            case "KSA" -> "KSA"; // Saudi Arabia
            case "CRC" -> "CRC"; // Costa Rica
            case "KOR" -> "KOR"; // South Korea
            default -> apiCode;
        };
    }

    /**
     * Manually trigger sync for a specific match by external ID
     */
    @Transactional
    public boolean syncSingleMatch(Long externalMatchId) {
        if (!isEnabled()) {
            return false;
        }

        try {
            ApiMatch apiMatch = getWebClient()
                    .get()
                    .uri("/matches/{matchId}", externalMatchId)
                    .retrieve()
                    .bodyToMono(ApiMatch.class)
                    .block();

            if (apiMatch != null) {
                return processApiMatch(apiMatch);
            }
        } catch (Exception e) {
            log.error("Error syncing match {}", externalMatchId, e);
        }

        return false;
    }

    /**
     * Look up the external service's current result for a single local match and
     * return it aligned to our home/away orientation, WITHOUT persisting anything.
     * Used by the admin "verify result" screen to compare against the stored value.
     */
    public MatchResultCheckResponse checkResultForMatch(Match localMatch) {
        MatchResultCheckResponse resp = new MatchResultCheckResponse();

        if (!isEnabled()) {
            resp.setFound(false);
            resp.setMessage("Football-Data API is not enabled");
            return resp;
        }

        ApiMatch apiMatch = fetchApiMatchFor(localMatch);
        if (apiMatch == null) {
            resp.setFound(false);
            resp.setMessage("No matching result found in the external service");
            return resp;
        }

        resp.setStatus(apiMatch.getStatus());

        ApiScore score = apiMatch.getScore();
        if (score == null || score.getFullTime() == null
                || score.getFullTime().getHome() == null
                || score.getFullTime().getAway() == null) {
            resp.setFound(false);
            resp.setMessage("External service has no final score yet (status: " + apiMatch.getStatus() + ")");
            return resp;
        }

        boolean swap = shouldSwapScores(localMatch, apiMatch);
        int homeScore = swap ? score.getFullTime().getAway() : score.getFullTime().getHome();
        int awayScore = swap ? score.getFullTime().getHome() : score.getFullTime().getAway();
        resp.setFound(true);
        resp.setHomeScore(homeScore);
        resp.setAwayScore(awayScore);

        if (score.getPenalties() != null
                && score.getPenalties().getHome() != null
                && score.getPenalties().getAway() != null) {
            resp.setHomePenaltyScore(swap ? score.getPenalties().getAway() : score.getPenalties().getHome());
            resp.setAwayPenaltyScore(swap ? score.getPenalties().getHome() : score.getPenalties().getAway());
        }

        // Derive the advancing team for knockout matches so the admin form can
        // pre-select it (score first, then penalties on a draw).
        if (localMatch.getStage() != Match.Stage.GROUP) {
            Long homeId = localMatch.getHomeTeam() != null ? localMatch.getHomeTeam().getId() : null;
            Long awayId = localMatch.getAwayTeam() != null ? localMatch.getAwayTeam().getId() : null;
            if (homeScore > awayScore) {
                resp.setWinnerTeamId(homeId);
            } else if (awayScore > homeScore) {
                resp.setWinnerTeamId(awayId);
            } else if (resp.getHomePenaltyScore() != null && resp.getAwayPenaltyScore() != null) {
                resp.setWinnerTeamId(
                        resp.getHomePenaltyScore() > resp.getAwayPenaltyScore() ? homeId : awayId);
            }
        }

        return resp;
    }

    /**
     * Fetch the API match for a local match: by external id when we have one,
     * otherwise by scanning the competition feed for the same pair of teams
     * (in either home/away order).
     */
    private ApiMatch fetchApiMatchFor(Match localMatch) {
        if (localMatch.getExternalApiId() != null) {
            try {
                ApiMatch m = getWebClient()
                        .get()
                        .uri("/matches/{matchId}", localMatch.getExternalApiId())
                        .retrieve()
                        .bodyToMono(ApiMatch.class)
                        .block();
                if (m != null) {
                    return m;
                }
            } catch (Exception e) {
                log.warn("check-result: fetch by external id {} failed: {}",
                        localMatch.getExternalApiId(), e.getMessage());
            }
        }

        if (localMatch.getHomeTeam() == null || localMatch.getAwayTeam() == null) {
            return null;
        }

        MatchesResponse response = fetchMatches();
        if (response == null || response.getMatches() == null) {
            return null;
        }

        String homeCode = localMatch.getHomeTeam().getCode();
        String awayCode = localMatch.getAwayTeam().getCode();
        for (ApiMatch m : response.getMatches()) {
            if (m.getHomeTeam() == null || m.getAwayTeam() == null) {
                continue;
            }
            String ah = mapApiTeamCode(m.getHomeTeam().getTla());
            String aa = mapApiTeamCode(m.getAwayTeam().getTla());
            if (ah == null || aa == null) {
                continue;
            }
            if ((ah.equals(homeCode) && aa.equals(awayCode))
                    || (ah.equals(awayCode) && aa.equals(homeCode))) {
                return m;
            }
        }

        return null;
    }

    // Top scorers are cached briefly: the dashboard shows them to every visitor,
    // and the free API tier allows only a handful of requests per minute.
    private static final long SCORERS_CACHE_TTL_MS = 120_000; // 2 minutes
    private volatile List<TopScorerDTO> cachedScorers;
    private volatile long cachedScorersAt;

    /**
     * Fetch the competition's current top scorers from the external service,
     * served from a short-lived cache. Returns an empty list when the API is
     * disabled, or when it fails and no cached value is available.
     */
    public List<TopScorerDTO> fetchTopScorers(int limit) {
        if (!isEnabled()) {
            log.warn("Football-Data API is not enabled; cannot fetch scorers");
            return new ArrayList<>();
        }

        long now = System.currentTimeMillis();
        List<TopScorerDTO> cache = cachedScorers;
        if (cache != null && now - cachedScorersAt < SCORERS_CACHE_TTL_MS && cache.size() >= limit) {
            return topN(cache, limit);
        }

        try {
            // Always fetch at least 10 so one call serves both the dashboard (5)
            // and the admin panel (10) from the same cache entry.
            List<TopScorerDTO> fetched = fetchScorersFromApi(Math.max(limit, 10));
            cachedScorers = fetched;
            cachedScorersAt = now;
            return topN(fetched, limit);
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch scorers from Football-Data.org: {} - {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error fetching scorers from Football-Data.org", e);
        }
        // On failure, serve the last good list if we have one; otherwise empty.
        return (cache != null && cache.size() >= limit) ? topN(cache, limit) : new ArrayList<>();
    }

    private List<TopScorerDTO> fetchScorersFromApi(int limit) {
        ScorersResponse response = getWebClient()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/competitions/{competitionId}/scorers")
                        .queryParam("limit", limit)
                        .build(competitionId))
                .retrieve()
                .bodyToMono(ScorersResponse.class)
                .block();

        List<TopScorerDTO> scorers = new ArrayList<>();
        if (response == null || response.getScorers() == null) {
            return scorers;
        }
        for (Scorer s : response.getScorers()) {
            if (s.getPlayer() == null) {
                continue;
            }
            scorers.add(new TopScorerDTO(
                    s.getPlayer().getName(),
                    s.getPlayer().getNationality(),
                    s.getTeam() != null ? s.getTeam().getName() : null,
                    s.getTeam() != null ? mapApiTeamCode(s.getTeam().getTla()) : null,
                    s.getGoals(),
                    s.getPlayedMatches()));
        }
        return scorers;
    }

    private List<TopScorerDTO> topN(List<TopScorerDTO> list, int n) {
        return new ArrayList<>(list.subList(0, Math.min(n, list.size())));
    }

    // Group standings are cached briefly (used to resolve knockout placeholders).
    private static final long STANDINGS_CACHE_TTL_MS = 120_000; // 2 minutes
    private volatile Map<String, List<String>> cachedStandings;
    private volatile long cachedStandingsAt;

    /**
     * Fetch current group standings, returned as a map of group letter (A..L) to
     * the ordered list of our team codes by position (index 0 = 1st). Cached
     * briefly. Returns an empty map when the API is disabled or fails with no
     * cached value.
     */
    public Map<String, List<String>> fetchGroupStandings() {
        if (!isEnabled()) {
            return new HashMap<>();
        }

        long now = System.currentTimeMillis();
        Map<String, List<String>> cache = cachedStandings;
        if (cache != null && now - cachedStandingsAt < STANDINGS_CACHE_TTL_MS) {
            return cache;
        }

        try {
            StandingsResponse response = getWebClient()
                    .get()
                    .uri("/competitions/{competitionId}/standings", competitionId)
                    .retrieve()
                    .bodyToMono(StandingsResponse.class)
                    .block();

            Map<String, List<String>> result = new HashMap<>();
            if (response != null && response.getStandings() != null) {
                for (StandingGroup sg : response.getStandings()) {
                    if (sg.getType() != null && !"TOTAL".equals(sg.getType())) {
                        continue;
                    }
                    if (sg.getGroup() == null || sg.getTable() == null) {
                        continue;
                    }
                    String letter = sg.getGroup().replace("Group", "").trim();
                    List<String> codes = new ArrayList<>();
                    for (TableEntry te : sg.getTable()) {
                        codes.add(te.getTeam() != null ? mapApiTeamCode(te.getTeam().getTla()) : null);
                    }
                    result.put(letter, codes);
                }
            }
            cachedStandings = result;
            cachedStandingsAt = now;
            return result;
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch standings from Football-Data.org: {} - {}",
                    e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error fetching standings from Football-Data.org", e);
        }
        return cache != null ? cache : new HashMap<>();
    }

    // DTO classes for API response

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MatchesResponse {
        private List<ApiMatch> matches;
        private CompetitionInfo competition;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CompetitionInfo {
        private Long id;
        private String name;
        private String code;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ApiMatch {
        private Long id;
        private String status;
        private String matchday;
        private String stage;
        private String group;

        @JsonProperty("utcDate")
        private String utcDate;

        private ApiTeam homeTeam;
        private ApiTeam awayTeam;
        private ApiScore score;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ApiTeam {
        private Long id;
        private String name;
        private String shortName;
        private String tla; // 3-letter code
        private String crest;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ApiScore {
        private String winner;
        private String duration;
        private ScoreDetail fullTime;
        private ScoreDetail halfTime;
        private ScoreDetail penalties;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ScoreDetail {
        private Integer home;
        private Integer away;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ScorersResponse {
        private List<Scorer> scorers;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Scorer {
        private ApiPlayer player;
        private ApiTeam team;
        private Integer goals;
        private Integer playedMatches;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ApiPlayer {
        private Long id;
        private String name;
        private String nationality;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StandingsResponse {
        private List<StandingGroup> standings;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StandingGroup {
        private String stage;
        private String type;
        private String group;
        private List<TableEntry> table;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TableEntry {
        private Integer position;
        private ApiTeam team;
    }

    @Data
    public static class SyncResult {
        private int processed = 0;
        private int updated = 0;
        private int errors = 0;
        private String message;
        private Instant lastSync = Instant.now();

        public void incrementProcessed() { processed++; }
        public void incrementUpdated() { updated++; }
        public void incrementErrors() { errors++; }
    }
}
