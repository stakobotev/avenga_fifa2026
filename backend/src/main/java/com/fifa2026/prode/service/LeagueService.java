package com.fifa2026.prode.service;

import com.fifa2026.prode.dto.LeaderboardEntryDTO;
import com.fifa2026.prode.dto.LeagueDTO;
import com.fifa2026.prode.dto.LeagueRequest;
import com.fifa2026.prode.dto.UserDTO;
import com.fifa2026.prode.entity.League;
import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeagueService {

    private final LeagueRepository leagueRepository;
    private final UserRepository userRepository;
    private final PredictionRepository predictionRepository;
    private final BonusPredictionRepository bonusPredictionRepository;

    @Transactional
    public LeagueDTO createLeague(Long ownerId, LeagueRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        League league = League.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(owner)
                .isPrivate(request.isPrivate())
                .prizes(request.getPrizes())
                .build();

        league.getMembers().add(owner);
        league = leagueRepository.save(league);

        return LeagueDTO.fromEntity(league);
    }

    public LeagueDTO getLeagueById(Long id) {
        return leagueRepository.findById(id)
                .map(LeagueDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("League not found"));
    }

    public LeagueDTO getLeagueByInviteCode(String inviteCode) {
        return leagueRepository.findByInviteCode(inviteCode)
                .map(LeagueDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("League not found"));
    }

    public List<LeagueDTO> getUserLeagues(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return leagueRepository.findByMember(user).stream()
                .map(LeagueDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeagueDTO joinLeague(Long userId, String inviteCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        League league = leagueRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("Invalid invite code"));

        if (league.getMembers().contains(user)) {
            throw new RuntimeException("Already a member of this league");
        }

        league.getMembers().add(user);
        league = leagueRepository.save(league);

        return LeagueDTO.fromEntity(league);
    }

    @Transactional
    public void leaveLeague(Long userId, Long leagueId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        League league = leagueRepository.findById(leagueId)
                .orElseThrow(() -> new RuntimeException("League not found"));

        if (league.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Owner cannot leave the league");
        }

        league.getMembers().remove(user);
        leagueRepository.save(league);
    }

    public List<LeaderboardEntryDTO> getLeagueLeaderboard(Long leagueId) {
        League league = leagueRepository.findById(leagueId)
                .orElseThrow(() -> new RuntimeException("League not found"));

        List<LeaderboardEntryDTO> entries = new ArrayList<>();

        for (User member : league.getMembers()) {
            int matchPoints = predictionRepository.getTotalPointsForUser(member);
            int bonusPoints = bonusPredictionRepository.getTotalBonusPointsForUser(member);
            int exactScores = predictionRepository.getExactScoreCountForUser(member);
            int correctPredictions = predictionRepository.getCorrectPredictionCountForUser(member);
            int totalPredictions = predictionRepository.findByUser(member).size();

            LeaderboardEntryDTO entry = LeaderboardEntryDTO.builder()
                    .user(UserDTO.fromEntity(member))
                    .totalPoints(matchPoints + bonusPoints)
                    .matchPoints(matchPoints)
                    .bonusPoints(bonusPoints)
                    .exactScores(exactScores)
                    .correctPredictions(correctPredictions)
                    .totalPredictions(totalPredictions)
                    .build();

            entries.add(entry);
        }

        // Sort by total points, then exact scores, then correct predictions
        entries.sort(Comparator
                .comparingInt(LeaderboardEntryDTO::getTotalPoints).reversed()
                .thenComparingInt(LeaderboardEntryDTO::getExactScores).reversed()
                .thenComparingInt(LeaderboardEntryDTO::getCorrectPredictions).reversed()
        );

        assignCompetitionRanks(entries);

        return entries;
    }

    /**
     * Standard competition ("1224") ranking: entries with the same total points share
     * the same rank, and the next lower total resumes at the absolute position. E.g.
     * three users on 39 pts are all 30th, and the next user (38 pts) is 33rd.
     * Assumes {@code entries} is already sorted best-first.
     */
    private void assignCompetitionRanks(List<LeaderboardEntryDTO> entries) {
        for (int i = 0; i < entries.size(); i++) {
            if (i > 0 && entries.get(i).getTotalPoints() == entries.get(i - 1).getTotalPoints()) {
                entries.get(i).setRank(entries.get(i - 1).getRank());
            } else {
                entries.get(i).setRank(i + 1);
            }
        }
    }

    public List<UserDTO> getLeagueMembers(Long leagueId) {
        League league = leagueRepository.findById(leagueId)
                .orElseThrow(() -> new RuntimeException("League not found"));

        return league.getMembers().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
