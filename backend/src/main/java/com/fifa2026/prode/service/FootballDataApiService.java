package com.fifa2026.prode.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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
import java.util.List;
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
