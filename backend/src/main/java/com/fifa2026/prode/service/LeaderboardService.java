package com.fifa2026.prode.service;

import com.fifa2026.prode.dto.LeaderboardEntryDTO;
import com.fifa2026.prode.dto.UserDTO;
import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.repository.BonusPredictionRepository;
import com.fifa2026.prode.repository.PredictionRepository;
import com.fifa2026.prode.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final PredictionRepository predictionRepository;
    private final BonusPredictionRepository bonusPredictionRepository;

    public List<LeaderboardEntryDTO> getGlobalLeaderboard() {
        return getLeaderboard(null);
    }

    public List<LeaderboardEntryDTO> getRegionalLeaderboard(String region) {
        User.Region userRegion = User.Region.valueOf(region.toUpperCase());
        return getLeaderboard(userRegion);
    }

    public List<String> getAvailableRegions() {
        List<String> regions = new ArrayList<>();
        for (User.Region region : User.Region.values()) {
            regions.add(region.name());
        }
        return regions;
    }

    private List<LeaderboardEntryDTO> getLeaderboard(User.Region region) {
        List<User> users;
        if (region != null) {
            users = userRepository.findByRegion(region);
        } else {
            users = userRepository.findAll();
        }

        List<LeaderboardEntryDTO> entries = new ArrayList<>();

        for (User user : users) {
            int matchPoints = predictionRepository.getTotalPointsForUser(user);
            int bonusPoints = bonusPredictionRepository.getTotalBonusPointsForUser(user);
            int exactScores = predictionRepository.getExactScoreCountForUser(user);
            int correctPredictions = predictionRepository.getCorrectPredictionCountForUser(user);
            int totalPredictions = predictionRepository.findByUser(user).size();

            LeaderboardEntryDTO entry = LeaderboardEntryDTO.builder()
                    .user(UserDTO.fromEntity(user))
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

        // Assign ranks
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        return entries;
    }

    public LeaderboardEntryDTO getUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int matchPoints = predictionRepository.getTotalPointsForUser(user);
        int bonusPoints = bonusPredictionRepository.getTotalBonusPointsForUser(user);
        int exactScores = predictionRepository.getExactScoreCountForUser(user);
        int correctPredictions = predictionRepository.getCorrectPredictionCountForUser(user);
        int totalPredictions = predictionRepository.findByUser(user).size();

        // Calculate rank
        List<LeaderboardEntryDTO> leaderboard = getGlobalLeaderboard();
        int rank = 1;
        for (LeaderboardEntryDTO entry : leaderboard) {
            if (entry.getUser().getId().equals(userId)) {
                rank = entry.getRank();
                break;
            }
        }

        return LeaderboardEntryDTO.builder()
                .rank(rank)
                .user(UserDTO.fromEntity(user))
                .totalPoints(matchPoints + bonusPoints)
                .matchPoints(matchPoints)
                .bonusPoints(bonusPoints)
                .exactScores(exactScores)
                .correctPredictions(correctPredictions)
                .totalPredictions(totalPredictions)
                .build();
    }
}
