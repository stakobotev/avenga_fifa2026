package com.fifa2026.prode.controller;

import com.fifa2026.prode.dto.TeamDTO;
import com.fifa2026.prode.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public ResponseEntity<List<TeamDTO>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getTeamById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<TeamDTO> getTeamByCode(@PathVariable String code) {
        return ResponseEntity.ok(teamService.getTeamByCode(code));
    }

    @GetMapping("/group/{groupLetter}")
    public ResponseEntity<List<TeamDTO>> getTeamsByGroup(@PathVariable String groupLetter) {
        return ResponseEntity.ok(teamService.getTeamsByGroup(groupLetter));
    }

    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<TeamDTO>>> getTeamsGrouped() {
        return ResponseEntity.ok(teamService.getTeamsGroupedByGroup());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeamDTO> createTeam(@RequestBody TeamDTO teamDTO) {
        return ResponseEntity.ok(teamService.createTeam(teamDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeamDTO> updateTeam(@PathVariable Long id, @RequestBody TeamDTO teamDTO) {
        return ResponseEntity.ok(teamService.updateTeam(id, teamDTO));
    }
}
