package com.fifa2026.prode.controller;

import com.fifa2026.prode.dto.MatchDTO;
import com.fifa2026.prode.dto.MatchResultCheckResponse;
import com.fifa2026.prode.dto.MatchResultRequest;
import com.fifa2026.prode.dto.MatchTeamsRequest;
import com.fifa2026.prode.dto.TopScorerDTO;
import com.fifa2026.prode.scheduler.MatchSyncScheduler;
import com.fifa2026.prode.service.FootballDataApiService;
import com.fifa2026.prode.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;
    private final MatchSyncScheduler matchSyncScheduler;
    private final FootballDataApiService footballDataApiService;

    @GetMapping
    public ResponseEntity<List<MatchDTO>> getAllMatches() {
        return ResponseEntity.ok(matchService.getAllMatches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchDTO> getMatchById(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.getMatchById(id));
    }

    @GetMapping("/stage/{stage}")
    public ResponseEntity<List<MatchDTO>> getMatchesByStage(@PathVariable String stage) {
        return ResponseEntity.ok(matchService.getMatchesByStage(stage));
    }

    @GetMapping("/group/{groupLetter}")
    public ResponseEntity<List<MatchDTO>> getMatchesByGroup(@PathVariable String groupLetter) {
        return ResponseEntity.ok(matchService.getMatchesByGroup(groupLetter));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<MatchDTO>> getUpcomingMatches() {
        return ResponseEntity.ok(matchService.getUpcomingMatches());
    }

    @GetMapping("/today")
    public ResponseEntity<List<MatchDTO>> getTodayMatches() {
        return ResponseEntity.ok(matchService.getTodayMatches());
    }

    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<MatchDTO>>> getMatchesGrouped() {
        return ResponseEntity.ok(matchService.getMatchesGroupedByStage());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchDTO> createMatch(@RequestBody MatchDTO matchDTO) {
        return ResponseEntity.ok(matchService.createMatch(matchDTO));
    }

    @PutMapping("/{id}/result")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchDTO> updateMatchResult(
            @PathVariable Long id,
            @Valid @RequestBody MatchResultRequest request) {
        return ResponseEntity.ok(matchService.updateMatchResult(id, request));
    }

    @GetMapping("/{id}/check-result")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchResultCheckResponse> checkMatchResult(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.checkExternalResult(id));
    }

    @PutMapping("/{id}/date")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchDTO> updateMatchDate(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String dateStr = request.get("matchDate");
        Instant newDate;
        // Check for UTC indicator (Z) or timezone offset (+/-HH:MM after T)
        if (dateStr.endsWith("Z") || dateStr.matches(".*T.*[+-]\\d{2}:\\d{2}$")) {
            // Already has timezone info (ISO 8601 with Z or offset)
            newDate = Instant.parse(dateStr);
        } else {
            // No timezone - treat as UTC
            newDate = LocalDateTime.parse(dateStr).toInstant(ZoneOffset.UTC);
        }
        return ResponseEntity.ok(matchService.updateMatchDate(id, newDate));
    }

    @PutMapping("/{id}/teams")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchDTO> updateMatchTeams(
            @PathVariable Long id,
            @RequestBody MatchTeamsRequest request) {
        return ResponseEntity.ok(
                matchService.updateMatchTeams(id, request.getHomeTeamId(), request.getAwayTeamId()));
    }

    @PostMapping("/{id}/reset")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchDTO> resetMatch(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.resetMatch(id));
    }

    // Sync endpoints for Football-Data.org integration

    @GetMapping("/sync/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SyncStatusResponse> getSyncStatus() {
        SyncStatusResponse response = new SyncStatusResponse();
        response.setEnabled(footballDataApiService.isEnabled());
        response.setLastSyncResult(matchSyncScheduler.getLastSyncResult());
        response.setLastSyncAttempt(matchSyncScheduler.getLastSyncAttempt());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sync/trigger")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FootballDataApiService.SyncResult> triggerSync() {
        return ResponseEntity.ok(matchSyncScheduler.triggerManualSync());
    }

    // Public read-only data (also shown on the user dashboard). Cached server-side
    // so multiple viewers don't exhaust the external API's rate limit.
    @GetMapping("/scorers")
    public ResponseEntity<List<TopScorerDTO>> getTopScorers(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(footballDataApiService.fetchTopScorers(limit));
    }

    @lombok.Data
    public static class SyncStatusResponse {
        private boolean enabled;
        private FootballDataApiService.SyncResult lastSyncResult;
        private Instant lastSyncAttempt;
    }
}
