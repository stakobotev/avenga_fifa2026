package com.fifa2026.prode.controller;

import com.fifa2026.prode.dto.LeaderboardEntryDTO;
import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.service.CurrentUserService;
import com.fifa2026.prode.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<List<LeaderboardEntryDTO>> getGlobalLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard());
    }

    @GetMapping("/region/{region}")
    public ResponseEntity<List<LeaderboardEntryDTO>> getRegionalLeaderboard(@PathVariable String region) {
        return ResponseEntity.ok(leaderboardService.getRegionalLeaderboard(region));
    }

    @GetMapping("/regions")
    public ResponseEntity<List<String>> getAvailableRegions() {
        return ResponseEntity.ok(leaderboardService.getAvailableRegions());
    }

    @GetMapping("/me")
    public ResponseEntity<LeaderboardEntryDTO> getMyStats() {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(leaderboardService.getUserStats(user.getId()));
    }
}
