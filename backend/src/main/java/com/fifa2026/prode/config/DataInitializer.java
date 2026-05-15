package com.fifa2026.prode.config;

import com.fifa2026.prode.entity.Match;
import com.fifa2026.prode.entity.Team;
import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.repository.MatchRepository;
import com.fifa2026.prode.repository.TeamRepository;
import com.fifa2026.prode.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final TeamRepository teamRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (teamRepository.count() == 0) {
            initializeTeams();
            initializeMatches();
        } else {
            // Check if knockout matches exist, if not create them
            long knockoutMatchCount = matchRepository.findAll().stream()
                    .filter(m -> m.getStage() != Match.Stage.GROUP)
                    .count();
            if (knockoutMatchCount == 0) {
                log.info("No knockout matches found, creating them...");
                Map<String, Team> teamsByCode = teamRepository.findAll().stream()
                        .collect(Collectors.toMap(Team::getCode, t -> t));
                int lastMatchNumber = matchRepository.findAll().stream()
                        .mapToInt(m -> m.getMatchNumber() != null ? m.getMatchNumber() : 0)
                        .max()
                        .orElse(48);
                LocalDateTime startDate = LocalDateTime.of(2026, 6, 11, 20, 0);
                initializeKnockoutMatches(teamsByCode, startDate, lastMatchNumber + 1);
            }
        }
        initializeAdminUser();
    }

    private void initializeAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@prode2026.com")
                    .password(passwordEncoder.encode("admin123"))
                    .displayName("Administrator")
                    .role(User.Role.ADMIN)
                    .authProvider(User.AuthProvider.LOCAL)
                    .build();
            userRepository.save(admin);
            log.info("Admin user created: admin / admin123");
        }
    }

    private void initializeTeams() {
        List<Team> teams = Arrays.asList(
            // Group A
            Team.builder().name("Mexico").code("MEX").groupLetter("A").confederation("CONCACAF").fifaRanking(15).build(),
            Team.builder().name("United States").code("USA").groupLetter("A").confederation("CONCACAF").fifaRanking(11).build(),
            Team.builder().name("Canada").code("CAN").groupLetter("A").confederation("CONCACAF").fifaRanking(43).build(),
            Team.builder().name("Jamaica").code("JAM").groupLetter("A").confederation("CONCACAF").fifaRanking(57).build(),

            // Group B
            Team.builder().name("Argentina").code("ARG").groupLetter("B").confederation("CONMEBOL").fifaRanking(1).build(),
            Team.builder().name("Peru").code("PER").groupLetter("B").confederation("CONMEBOL").fifaRanking(32).build(),
            Team.builder().name("Chile").code("CHI").groupLetter("B").confederation("CONMEBOL").fifaRanking(41).build(),
            Team.builder().name("Ecuador").code("ECU").groupLetter("B").confederation("CONMEBOL").fifaRanking(30).build(),

            // Group C
            Team.builder().name("France").code("FRA").groupLetter("C").confederation("UEFA").fifaRanking(2).build(),
            Team.builder().name("Australia").code("AUS").groupLetter("C").confederation("AFC").fifaRanking(24).build(),
            Team.builder().name("Tunisia").code("TUN").groupLetter("C").confederation("CAF").fifaRanking(40).build(),
            Team.builder().name("Saudi Arabia").code("KSA").groupLetter("C").confederation("AFC").fifaRanking(56).build(),

            // Group D
            Team.builder().name("Brazil").code("BRA").groupLetter("D").confederation("CONMEBOL").fifaRanking(5).build(),
            Team.builder().name("Colombia").code("COL").groupLetter("D").confederation("CONMEBOL").fifaRanking(12).build(),
            Team.builder().name("Paraguay").code("PAR").groupLetter("D").confederation("CONMEBOL").fifaRanking(55).build(),
            Team.builder().name("Venezuela").code("VEN").groupLetter("D").confederation("CONMEBOL").fifaRanking(54).build(),

            // Group E
            Team.builder().name("Germany").code("GER").groupLetter("E").confederation("UEFA").fifaRanking(16).build(),
            Team.builder().name("Japan").code("JPN").groupLetter("E").confederation("AFC").fifaRanking(18).build(),
            Team.builder().name("Serbia").code("SRB").groupLetter("E").confederation("UEFA").fifaRanking(33).build(),
            Team.builder().name("New Zealand").code("NZL").groupLetter("E").confederation("OFC").fifaRanking(93).build(),

            // Group F
            Team.builder().name("Portugal").code("POR").groupLetter("F").confederation("UEFA").fifaRanking(6).build(),
            Team.builder().name("Morocco").code("MAR").groupLetter("F").confederation("CAF").fifaRanking(13).build(),
            Team.builder().name("Iran").code("IRN").groupLetter("F").confederation("AFC").fifaRanking(21).build(),
            Team.builder().name("Ghana").code("GHA").groupLetter("F").confederation("CAF").fifaRanking(67).build(),

            // Group G
            Team.builder().name("Spain").code("ESP").groupLetter("G").confederation("UEFA").fifaRanking(8).build(),
            Team.builder().name("Croatia").code("CRO").groupLetter("G").confederation("UEFA").fifaRanking(9).build(),
            Team.builder().name("Uruguay").code("URU").groupLetter("G").confederation("CONMEBOL").fifaRanking(14).build(),
            Team.builder().name("Costa Rica").code("CRC").groupLetter("G").confederation("CONCACAF").fifaRanking(48).build(),

            // Group H
            Team.builder().name("England").code("ENG").groupLetter("H").confederation("UEFA").fifaRanking(4).build(),
            Team.builder().name("Netherlands").code("NED").groupLetter("H").confederation("UEFA").fifaRanking(3).build(),
            Team.builder().name("Senegal").code("SEN").groupLetter("H").confederation("CAF").fifaRanking(17).build(),
            Team.builder().name("South Korea").code("KOR").groupLetter("H").confederation("AFC").fifaRanking(22).build()
        );

        teamRepository.saveAll(teams);
        log.info("Initialized {} teams", teams.size());
    }

    private void initializeMatches() {
        Map<String, Team> teamsByCode = teamRepository.findAll().stream()
                .collect(Collectors.toMap(Team::getCode, t -> t));

        // Tournament starts June 11, 2026
        // For testing: use LocalDateTime.now().minusDays(2) to simulate started tournament
        LocalDateTime startDate = LocalDateTime.of(2026, 6, 11, 20, 0);
        int matchNumber = 1;

        // Group A matches
        createGroupMatch(teamsByCode, "MEX", "JAM", startDate, "Estadio Azteca", "Mexico City", "A", matchNumber++);
        createGroupMatch(teamsByCode, "USA", "CAN", startDate.plusHours(3), "MetLife Stadium", "New Jersey", "A", matchNumber++);
        createGroupMatch(teamsByCode, "MEX", "CAN", startDate.plusDays(4), "Estadio Azteca", "Mexico City", "A", matchNumber++);
        createGroupMatch(teamsByCode, "USA", "JAM", startDate.plusDays(4).plusHours(3), "SoFi Stadium", "Los Angeles", "A", matchNumber++);
        createGroupMatch(teamsByCode, "MEX", "USA", startDate.plusDays(8), "AT&T Stadium", "Dallas", "A", matchNumber++);
        createGroupMatch(teamsByCode, "CAN", "JAM", startDate.plusDays(8), "BMO Field", "Toronto", "A", matchNumber++);

        // Group B matches
        createGroupMatch(teamsByCode, "ARG", "ECU", startDate.plusDays(1), "Hard Rock Stadium", "Miami", "B", matchNumber++);
        createGroupMatch(teamsByCode, "PER", "CHI", startDate.plusDays(1).plusHours(3), "Levi's Stadium", "Santa Clara", "B", matchNumber++);
        createGroupMatch(teamsByCode, "ARG", "CHI", startDate.plusDays(5), "Hard Rock Stadium", "Miami", "B", matchNumber++);
        createGroupMatch(teamsByCode, "PER", "ECU", startDate.plusDays(5).plusHours(3), "Mercedes-Benz Stadium", "Atlanta", "B", matchNumber++);
        createGroupMatch(teamsByCode, "ARG", "PER", startDate.plusDays(9), "MetLife Stadium", "New Jersey", "B", matchNumber++);
        createGroupMatch(teamsByCode, "CHI", "ECU", startDate.plusDays(9), "Levi's Stadium", "Santa Clara", "B", matchNumber++);

        // Group C matches
        createGroupMatch(teamsByCode, "FRA", "KSA", startDate.plusDays(2), "SoFi Stadium", "Los Angeles", "C", matchNumber++);
        createGroupMatch(teamsByCode, "AUS", "TUN", startDate.plusDays(2).plusHours(3), "NRG Stadium", "Houston", "C", matchNumber++);
        createGroupMatch(teamsByCode, "FRA", "TUN", startDate.plusDays(6), "SoFi Stadium", "Los Angeles", "C", matchNumber++);
        createGroupMatch(teamsByCode, "AUS", "KSA", startDate.plusDays(6).plusHours(3), "AT&T Stadium", "Dallas", "C", matchNumber++);
        createGroupMatch(teamsByCode, "FRA", "AUS", startDate.plusDays(10), "MetLife Stadium", "New Jersey", "C", matchNumber++);
        createGroupMatch(teamsByCode, "TUN", "KSA", startDate.plusDays(10), "NRG Stadium", "Houston", "C", matchNumber++);

        // Group D matches
        createGroupMatch(teamsByCode, "BRA", "VEN", startDate.plusDays(3), "Hard Rock Stadium", "Miami", "D", matchNumber++);
        createGroupMatch(teamsByCode, "COL", "PAR", startDate.plusDays(3).plusHours(3), "Mercedes-Benz Stadium", "Atlanta", "D", matchNumber++);
        createGroupMatch(teamsByCode, "BRA", "PAR", startDate.plusDays(7), "MetLife Stadium", "New Jersey", "D", matchNumber++);
        createGroupMatch(teamsByCode, "COL", "VEN", startDate.plusDays(7).plusHours(3), "Hard Rock Stadium", "Miami", "D", matchNumber++);
        createGroupMatch(teamsByCode, "BRA", "COL", startDate.plusDays(11), "SoFi Stadium", "Los Angeles", "D", matchNumber++);
        createGroupMatch(teamsByCode, "PAR", "VEN", startDate.plusDays(11), "Mercedes-Benz Stadium", "Atlanta", "D", matchNumber++);

        // Group E matches
        createGroupMatch(teamsByCode, "GER", "NZL", startDate.plusDays(1), "Lincoln Financial Field", "Philadelphia", "E", matchNumber++);
        createGroupMatch(teamsByCode, "JPN", "SRB", startDate.plusDays(1).plusHours(3), "Gillette Stadium", "Foxborough", "E", matchNumber++);
        createGroupMatch(teamsByCode, "GER", "SRB", startDate.plusDays(5), "MetLife Stadium", "New Jersey", "E", matchNumber++);
        createGroupMatch(teamsByCode, "JPN", "NZL", startDate.plusDays(5).plusHours(3), "BC Place", "Vancouver", "E", matchNumber++);
        createGroupMatch(teamsByCode, "GER", "JPN", startDate.plusDays(9), "AT&T Stadium", "Dallas", "E", matchNumber++);
        createGroupMatch(teamsByCode, "SRB", "NZL", startDate.plusDays(9), "Lincoln Financial Field", "Philadelphia", "E", matchNumber++);

        // Group F matches
        createGroupMatch(teamsByCode, "POR", "GHA", startDate.plusDays(2), "Mercedes-Benz Stadium", "Atlanta", "F", matchNumber++);
        createGroupMatch(teamsByCode, "MAR", "IRN", startDate.plusDays(2).plusHours(3), "Lumen Field", "Seattle", "F", matchNumber++);
        createGroupMatch(teamsByCode, "POR", "IRN", startDate.plusDays(6), "Hard Rock Stadium", "Miami", "F", matchNumber++);
        createGroupMatch(teamsByCode, "MAR", "GHA", startDate.plusDays(6).plusHours(3), "Mercedes-Benz Stadium", "Atlanta", "F", matchNumber++);
        createGroupMatch(teamsByCode, "POR", "MAR", startDate.plusDays(10), "SoFi Stadium", "Los Angeles", "F", matchNumber++);
        createGroupMatch(teamsByCode, "IRN", "GHA", startDate.plusDays(10), "Lumen Field", "Seattle", "F", matchNumber++);

        // Group G matches
        createGroupMatch(teamsByCode, "ESP", "CRC", startDate.plusDays(3), "Levi's Stadium", "Santa Clara", "G", matchNumber++);
        createGroupMatch(teamsByCode, "CRO", "URU", startDate.plusDays(3).plusHours(3), "SoFi Stadium", "Los Angeles", "G", matchNumber++);
        createGroupMatch(teamsByCode, "ESP", "URU", startDate.plusDays(7), "AT&T Stadium", "Dallas", "G", matchNumber++);
        createGroupMatch(teamsByCode, "CRO", "CRC", startDate.plusDays(7).plusHours(3), "Levi's Stadium", "Santa Clara", "G", matchNumber++);
        createGroupMatch(teamsByCode, "ESP", "CRO", startDate.plusDays(11), "MetLife Stadium", "New Jersey", "G", matchNumber++);
        createGroupMatch(teamsByCode, "URU", "CRC", startDate.plusDays(11), "NRG Stadium", "Houston", "G", matchNumber++);

        // Group H matches
        createGroupMatch(teamsByCode, "ENG", "KOR", startDate.plusDays(4), "MetLife Stadium", "New Jersey", "H", matchNumber++);
        createGroupMatch(teamsByCode, "NED", "SEN", startDate.plusDays(4).plusHours(3), "Lincoln Financial Field", "Philadelphia", "H", matchNumber++);
        createGroupMatch(teamsByCode, "ENG", "SEN", startDate.plusDays(8), "Hard Rock Stadium", "Miami", "H", matchNumber++);
        createGroupMatch(teamsByCode, "NED", "KOR", startDate.plusDays(8).plusHours(3), "NRG Stadium", "Houston", "H", matchNumber++);
        createGroupMatch(teamsByCode, "ENG", "NED", startDate.plusDays(12), "SoFi Stadium", "Los Angeles", "H", matchNumber++);
        createGroupMatch(teamsByCode, "SEN", "KOR", startDate.plusDays(12), "Gillette Stadium", "Foxborough", "H", matchNumber++);

        log.info("Initialized group stage matches");

        // Initialize knockout matches with placeholder teams (simulating qualified teams)
        initializeKnockoutMatches(teamsByCode, startDate, matchNumber);
    }

    private void initializeKnockoutMatches(Map<String, Team> teams, LocalDateTime groupStageStart, int matchNumber) {
        // Knockout stage starts after group stage (day 14)
        LocalDateTime knockoutStart = groupStageStart.plusDays(14);

        // Round of 32 (16 matches) - Day 14-17
        // Teams TBD - will be populated after group stage
        // Placeholders: 1A = 1st in Group A, 2B = 2nd in Group B, 3rd = Best 3rd place

        // Round of 32 - Day 14
        createKnockoutMatch(knockoutStart, "MetLife Stadium", "New Jersey", Match.Stage.ROUND_OF_32, matchNumber++, "1A", "3rd");
        createKnockoutMatch(knockoutStart.plusHours(3), "AT&T Stadium", "Dallas", Match.Stage.ROUND_OF_32, matchNumber++, "2A", "2C");
        createKnockoutMatch(knockoutStart.plusHours(6), "Hard Rock Stadium", "Miami", Match.Stage.ROUND_OF_32, matchNumber++, "1B", "3rd");
        createKnockoutMatch(knockoutStart.plusHours(9), "SoFi Stadium", "Los Angeles", Match.Stage.ROUND_OF_32, matchNumber++, "2B", "2D");

        // Round of 32 - Day 15
        createKnockoutMatch(knockoutStart.plusDays(1), "Levi's Stadium", "Santa Clara", Match.Stage.ROUND_OF_32, matchNumber++, "1C", "3rd");
        createKnockoutMatch(knockoutStart.plusDays(1).plusHours(3), "NRG Stadium", "Houston", Match.Stage.ROUND_OF_32, matchNumber++, "2E", "2G");
        createKnockoutMatch(knockoutStart.plusDays(1).plusHours(6), "Mercedes-Benz Stadium", "Atlanta", Match.Stage.ROUND_OF_32, matchNumber++, "1D", "3rd");
        createKnockoutMatch(knockoutStart.plusDays(1).plusHours(9), "Lincoln Financial Field", "Philadelphia", Match.Stage.ROUND_OF_32, matchNumber++, "2F", "2H");

        // Round of 32 - Day 16
        createKnockoutMatch(knockoutStart.plusDays(2), "MetLife Stadium", "New Jersey", Match.Stage.ROUND_OF_32, matchNumber++, "1E", "3rd");
        createKnockoutMatch(knockoutStart.plusDays(2).plusHours(3), "AT&T Stadium", "Dallas", Match.Stage.ROUND_OF_32, matchNumber++, "1F", "3rd");
        createKnockoutMatch(knockoutStart.plusDays(2).plusHours(6), "Hard Rock Stadium", "Miami", Match.Stage.ROUND_OF_32, matchNumber++, "1G", "3rd");
        createKnockoutMatch(knockoutStart.plusDays(2).plusHours(9), "SoFi Stadium", "Los Angeles", Match.Stage.ROUND_OF_32, matchNumber++, "1H", "3rd");

        // Round of 32 - Day 17
        createKnockoutMatch(knockoutStart.plusDays(3), "Levi's Stadium", "Santa Clara", Match.Stage.ROUND_OF_32, matchNumber++, "2A", "2E");
        createKnockoutMatch(knockoutStart.plusDays(3).plusHours(3), "NRG Stadium", "Houston", Match.Stage.ROUND_OF_32, matchNumber++, "2B", "2F");
        createKnockoutMatch(knockoutStart.plusDays(3).plusHours(6), "Mercedes-Benz Stadium", "Atlanta", Match.Stage.ROUND_OF_32, matchNumber++, "2C", "2G");
        createKnockoutMatch(knockoutStart.plusDays(3).plusHours(9), "Lincoln Financial Field", "Philadelphia", Match.Stage.ROUND_OF_32, matchNumber++, "2D", "2H");

        log.info("Initialized Round of 32 matches (teams TBD)");

        // Round of 16 (8 matches) - Day 19-20
        // Winners from Round of 32
        LocalDateTime r16Start = knockoutStart.plusDays(5);
        int r32Start = matchNumber - 16; // First R32 match number
        createKnockoutMatch(r16Start, "MetLife Stadium", "New Jersey", Match.Stage.ROUND_OF_16, matchNumber++, "W" + r32Start, "W" + (r32Start + 1));
        createKnockoutMatch(r16Start.plusHours(3), "AT&T Stadium", "Dallas", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 2), "W" + (r32Start + 3));
        createKnockoutMatch(r16Start.plusHours(6), "Hard Rock Stadium", "Miami", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 4), "W" + (r32Start + 5));
        createKnockoutMatch(r16Start.plusHours(9), "SoFi Stadium", "Los Angeles", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 6), "W" + (r32Start + 7));

        createKnockoutMatch(r16Start.plusDays(1), "Levi's Stadium", "Santa Clara", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 8), "W" + (r32Start + 9));
        createKnockoutMatch(r16Start.plusDays(1).plusHours(3), "NRG Stadium", "Houston", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 10), "W" + (r32Start + 11));
        createKnockoutMatch(r16Start.plusDays(1).plusHours(6), "Mercedes-Benz Stadium", "Atlanta", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 12), "W" + (r32Start + 13));
        createKnockoutMatch(r16Start.plusDays(1).plusHours(9), "Lincoln Financial Field", "Philadelphia", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 14), "W" + (r32Start + 15));

        log.info("Initialized Round of 16 matches (teams TBD)");

        // Quarter-finals (4 matches) - Day 22-23
        LocalDateTime qfStart = knockoutStart.plusDays(8);
        int r16StartNum = matchNumber - 8;
        createKnockoutMatch(qfStart, "MetLife Stadium", "New Jersey", Match.Stage.QUARTERFINAL, matchNumber++, "W" + r16StartNum, "W" + (r16StartNum + 1));
        createKnockoutMatch(qfStart.plusHours(4), "AT&T Stadium", "Dallas", Match.Stage.QUARTERFINAL, matchNumber++, "W" + (r16StartNum + 2), "W" + (r16StartNum + 3));
        createKnockoutMatch(qfStart.plusDays(1), "Hard Rock Stadium", "Miami", Match.Stage.QUARTERFINAL, matchNumber++, "W" + (r16StartNum + 4), "W" + (r16StartNum + 5));
        createKnockoutMatch(qfStart.plusDays(1).plusHours(4), "SoFi Stadium", "Los Angeles", Match.Stage.QUARTERFINAL, matchNumber++, "W" + (r16StartNum + 6), "W" + (r16StartNum + 7));

        log.info("Initialized Quarter-final matches (teams TBD)");

        // Semi-finals (2 matches) - Day 26-27
        LocalDateTime sfStart = knockoutStart.plusDays(12);
        int qfStartNum = matchNumber - 4;
        createKnockoutMatch(sfStart, "MetLife Stadium", "New Jersey", Match.Stage.SEMIFINAL, matchNumber++, "W" + qfStartNum, "W" + (qfStartNum + 1));
        createKnockoutMatch(sfStart.plusDays(1), "AT&T Stadium", "Dallas", Match.Stage.SEMIFINAL, matchNumber++, "W" + (qfStartNum + 2), "W" + (qfStartNum + 3));

        log.info("Initialized Semi-final matches (teams TBD)");

        // Third place playoff - Day 30
        LocalDateTime thirdPlaceDate = knockoutStart.plusDays(16);
        int sfStartNum = matchNumber - 2;
        createKnockoutMatch(thirdPlaceDate, "Hard Rock Stadium", "Miami", Match.Stage.THIRD_PLACE, matchNumber++, "L" + sfStartNum, "L" + (sfStartNum + 1));

        log.info("Initialized Third place match (teams TBD)");

        // Final - Day 31
        LocalDateTime finalDate = knockoutStart.plusDays(17);
        createKnockoutMatch(finalDate, "MetLife Stadium", "New Jersey", Match.Stage.FINAL, matchNumber, "W" + sfStartNum, "W" + (sfStartNum + 1));

        log.info("Initialized Final match (teams TBD)");
    }

    private void createKnockoutMatch(LocalDateTime date, String venue, String city,
                                      Match.Stage stage, int matchNumber,
                                      String homePlaceholder, String awayPlaceholder) {
        Match match = Match.builder()
                .homeTeam(null)
                .awayTeam(null)
                .homePlaceholder(homePlaceholder)
                .awayPlaceholder(awayPlaceholder)
                .matchDate(date)
                .venue(venue)
                .city(city)
                .stage(stage)
                .matchNumber(matchNumber)
                .status(Match.MatchStatus.SCHEDULED)
                .build();
        matchRepository.save(match);
    }

    private void createGroupMatch(Map<String, Team> teams, String homeCode, String awayCode,
                                   LocalDateTime date, String venue, String city, String group, int matchNumber) {
        Match match = Match.builder()
                .homeTeam(teams.get(homeCode))
                .awayTeam(teams.get(awayCode))
                .matchDate(date)
                .venue(venue)
                .city(city)
                .stage(Match.Stage.GROUP)
                .groupLetter(group)
                .matchNumber(matchNumber)
                .status(Match.MatchStatus.SCHEDULED)
                .build();
        matchRepository.save(match);
    }
}
