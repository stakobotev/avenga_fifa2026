package com.fifa2026.prode.controller;

import com.fifa2026.prode.dto.LeaderboardEntryDTO;
import com.fifa2026.prode.dto.LeagueDTO;
import com.fifa2026.prode.dto.LeagueRequest;
import com.fifa2026.prode.dto.UserDTO;
import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.service.CurrentUserService;
import com.fifa2026.prode.service.LeagueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leagues")
@RequiredArgsConstructor
public class LeagueController {

    private final LeagueService leagueService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<LeagueDTO> createLeague(@Valid @RequestBody LeagueRequest request) {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(leagueService.createLeague(user.getId(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeagueDTO> getLeagueById(@PathVariable Long id) {
        return ResponseEntity.ok(leagueService.getLeagueById(id));
    }

    @GetMapping("/invite/{inviteCode}")
    public ResponseEntity<LeagueDTO> getLeagueByInviteCode(@PathVariable String inviteCode) {
        return ResponseEntity.ok(leagueService.getLeagueByInviteCode(inviteCode));
    }

    @GetMapping("/my")
    public ResponseEntity<List<LeagueDTO>> getMyLeagues() {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(leagueService.getUserLeagues(user.getId()));
    }

    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<LeagueDTO> joinLeague(@PathVariable String inviteCode) {
        User user = currentUserService.getCurrentUser();
        return ResponseEntity.ok(leagueService.joinLeague(user.getId(), inviteCode));
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leaveLeague(@PathVariable Long id) {
        User user = currentUserService.getCurrentUser();
        leagueService.leaveLeague(user.getId(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeagueLeaderboard(@PathVariable Long id) {
        return ResponseEntity.ok(leagueService.getLeagueLeaderboard(id));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<UserDTO>> getLeagueMembers(@PathVariable Long id) {
        return ResponseEntity.ok(leagueService.getLeagueMembers(id));
    }
}
