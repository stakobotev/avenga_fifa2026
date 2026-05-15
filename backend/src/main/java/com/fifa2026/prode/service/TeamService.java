package com.fifa2026.prode.service;

import com.fifa2026.prode.dto.TeamDTO;
import com.fifa2026.prode.entity.Team;
import com.fifa2026.prode.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;

    public List<TeamDTO> getAllTeams() {
        return teamRepository.findAllByOrderByGroupLetterAscNameAsc().stream()
                .map(TeamDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public TeamDTO getTeamById(Long id) {
        return teamRepository.findById(id)
                .map(TeamDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Team not found"));
    }

    public TeamDTO getTeamByCode(String code) {
        return teamRepository.findByCode(code.toUpperCase())
                .map(TeamDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Team not found"));
    }

    public List<TeamDTO> getTeamsByGroup(String groupLetter) {
        return teamRepository.findByGroupLetterOrderByName(groupLetter.toUpperCase()).stream()
                .map(TeamDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Map<String, List<TeamDTO>> getTeamsGroupedByGroup() {
        List<Team> teams = teamRepository.findAllByOrderByGroupLetterAscNameAsc();
        return teams.stream()
                .filter(t -> t.getGroupLetter() != null)
                .map(TeamDTO::fromEntity)
                .collect(Collectors.groupingBy(TeamDTO::getGroupLetter));
    }

    @Transactional
    public TeamDTO createTeam(TeamDTO teamDTO) {
        Team team = Team.builder()
                .name(teamDTO.getName())
                .code(teamDTO.getCode().toUpperCase())
                .flagUrl(teamDTO.getFlagUrl())
                .groupLetter(teamDTO.getGroupLetter())
                .fifaRanking(teamDTO.getFifaRanking())
                .confederation(teamDTO.getConfederation())
                .build();

        team = teamRepository.save(team);
        return TeamDTO.fromEntity(team);
    }

    @Transactional
    public TeamDTO updateTeam(Long id, TeamDTO teamDTO) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        team.setName(teamDTO.getName());
        team.setCode(teamDTO.getCode().toUpperCase());
        team.setFlagUrl(teamDTO.getFlagUrl());
        team.setGroupLetter(teamDTO.getGroupLetter());
        team.setFifaRanking(teamDTO.getFifaRanking());
        team.setConfederation(teamDTO.getConfederation());

        team = teamRepository.save(team);
        return TeamDTO.fromEntity(team);
    }
}
