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

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
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
                // Match times in US Eastern Time (where most venues are)
                ZonedDateTime startDate = ZonedDateTime.of(2026, 6, 11, 20, 0, 0, 0, ZoneId.of("America/New_York"));
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
            // Group A: Mexico, South Korea, South Africa, Czechia
            Team.builder().name("Mexico").code("MEX").groupLetter("A").confederation("CONCACAF").build(),
            Team.builder().name("South Korea").code("KOR").groupLetter("A").confederation("AFC").build(),
            Team.builder().name("South Africa").code("RSA").groupLetter("A").confederation("CAF").build(),
            Team.builder().name("Czechia").code("CZE").groupLetter("A").confederation("UEFA").build(),

            // Group B: Canada, Switzerland, Qatar, Bosnia-Herzegovina
            Team.builder().name("Canada").code("CAN").groupLetter("B").confederation("CONCACAF").build(),
            Team.builder().name("Switzerland").code("SUI").groupLetter("B").confederation("UEFA").build(),
            Team.builder().name("Qatar").code("QAT").groupLetter("B").confederation("AFC").build(),
            Team.builder().name("Bosnia-Herzegovina").code("BIH").groupLetter("B").confederation("UEFA").build(),

            // Group C: Brazil, Morocco, Scotland, Haiti
            Team.builder().name("Brazil").code("BRA").groupLetter("C").confederation("CONMEBOL").build(),
            Team.builder().name("Morocco").code("MAR").groupLetter("C").confederation("CAF").build(),
            Team.builder().name("Scotland").code("SCO").groupLetter("C").confederation("UEFA").build(),
            Team.builder().name("Haiti").code("HAI").groupLetter("C").confederation("CONCACAF").build(),

            // Group D: USA, Paraguay, Australia, Turkey
            Team.builder().name("United States").code("USA").groupLetter("D").confederation("CONCACAF").build(),
            Team.builder().name("Paraguay").code("PAR").groupLetter("D").confederation("CONMEBOL").build(),
            Team.builder().name("Australia").code("AUS").groupLetter("D").confederation("AFC").build(),
            Team.builder().name("Turkey").code("TUR").groupLetter("D").confederation("UEFA").build(),

            // Group E: Germany, Ecuador, Ivory Coast, Curacao
            Team.builder().name("Germany").code("GER").groupLetter("E").confederation("UEFA").build(),
            Team.builder().name("Ecuador").code("ECU").groupLetter("E").confederation("CONMEBOL").build(),
            Team.builder().name("Ivory Coast").code("CIV").groupLetter("E").confederation("CAF").build(),
            Team.builder().name("Curacao").code("CUW").groupLetter("E").confederation("CONCACAF").build(),

            // Group F: Netherlands, Japan, Tunisia, Sweden
            Team.builder().name("Netherlands").code("NED").groupLetter("F").confederation("UEFA").build(),
            Team.builder().name("Japan").code("JPN").groupLetter("F").confederation("AFC").build(),
            Team.builder().name("Tunisia").code("TUN").groupLetter("F").confederation("CAF").build(),
            Team.builder().name("Sweden").code("SWE").groupLetter("F").confederation("UEFA").build(),

            // Group G: Belgium, Iran, Egypt, New Zealand
            Team.builder().name("Belgium").code("BEL").groupLetter("G").confederation("UEFA").build(),
            Team.builder().name("Iran").code("IRN").groupLetter("G").confederation("AFC").build(),
            Team.builder().name("Egypt").code("EGY").groupLetter("G").confederation("CAF").build(),
            Team.builder().name("New Zealand").code("NZL").groupLetter("G").confederation("OFC").build(),

            // Group H: Spain, Uruguay, Saudi Arabia, Cape Verde
            Team.builder().name("Spain").code("ESP").groupLetter("H").confederation("UEFA").build(),
            Team.builder().name("Uruguay").code("URU").groupLetter("H").confederation("CONMEBOL").build(),
            Team.builder().name("Saudi Arabia").code("KSA").groupLetter("H").confederation("AFC").build(),
            Team.builder().name("Cape Verde").code("CPV").groupLetter("H").confederation("CAF").build(),

            // Group I: France, Senegal, Norway, Iraq
            Team.builder().name("France").code("FRA").groupLetter("I").confederation("UEFA").build(),
            Team.builder().name("Senegal").code("SEN").groupLetter("I").confederation("CAF").build(),
            Team.builder().name("Norway").code("NOR").groupLetter("I").confederation("UEFA").build(),
            Team.builder().name("Iraq").code("IRQ").groupLetter("I").confederation("AFC").build(),

            // Group J: Argentina, Austria, Algeria, Jordan
            Team.builder().name("Argentina").code("ARG").groupLetter("J").confederation("CONMEBOL").build(),
            Team.builder().name("Austria").code("AUT").groupLetter("J").confederation("UEFA").build(),
            Team.builder().name("Algeria").code("ALG").groupLetter("J").confederation("CAF").build(),
            Team.builder().name("Jordan").code("JOR").groupLetter("J").confederation("AFC").build(),

            // Group K: Portugal, Colombia, Uzbekistan, DR Congo
            Team.builder().name("Portugal").code("POR").groupLetter("K").confederation("UEFA").build(),
            Team.builder().name("Colombia").code("COL").groupLetter("K").confederation("CONMEBOL").build(),
            Team.builder().name("Uzbekistan").code("UZB").groupLetter("K").confederation("AFC").build(),
            Team.builder().name("DR Congo").code("COD").groupLetter("K").confederation("CAF").build(),

            // Group L: England, Croatia, Panama, Ghana
            Team.builder().name("England").code("ENG").groupLetter("L").confederation("UEFA").build(),
            Team.builder().name("Croatia").code("CRO").groupLetter("L").confederation("UEFA").build(),
            Team.builder().name("Panama").code("PAN").groupLetter("L").confederation("CONCACAF").build(),
            Team.builder().name("Ghana").code("GHA").groupLetter("L").confederation("CAF").build()
        );

        teamRepository.saveAll(teams);
        log.info("Initialized {} teams", teams.size());
    }

    private void initializeMatches() {
        Map<String, Team> teamsByCode = teamRepository.findAll().stream()
                .collect(Collectors.toMap(Team::getCode, t -> t));

        // Tournament starts June 11, 2026
        // Match times specified in US Eastern Time (where most venues are located)
        // Stored as UTC Instant for consistent timezone handling
        ZonedDateTime startDate = ZonedDateTime.of(2026, 6, 11, 12, 0, 0, 0, ZoneId.of("America/New_York"));
        int matchNumber = 1;

        // Group A: Mexico, South Korea, South Africa, Czechia
        createGroupMatch(teamsByCode, "MEX", "RSA", startDate, "Estadio Azteca", "Mexico City", "A", matchNumber++);
        createGroupMatch(teamsByCode, "KOR", "CZE", startDate.plusHours(6), "AT&T Stadium", "Dallas", "A", matchNumber++);
        createGroupMatch(teamsByCode, "MEX", "KOR", startDate.plusDays(4), "Estadio Azteca", "Mexico City", "A", matchNumber++);
        createGroupMatch(teamsByCode, "RSA", "CZE", startDate.plusDays(4).plusHours(3), "NRG Stadium", "Houston", "A", matchNumber++);
        createGroupMatch(teamsByCode, "MEX", "CZE", startDate.plusDays(8), "AT&T Stadium", "Dallas", "A", matchNumber++);
        createGroupMatch(teamsByCode, "KOR", "RSA", startDate.plusDays(8), "NRG Stadium", "Houston", "A", matchNumber++);

        // Group B: Canada, Switzerland, Qatar, Bosnia-Herzegovina
        createGroupMatch(teamsByCode, "CAN", "QAT", startDate.plusHours(3), "BMO Field", "Toronto", "B", matchNumber++);
        createGroupMatch(teamsByCode, "SUI", "BIH", startDate.plusHours(9), "BC Place", "Vancouver", "B", matchNumber++);
        createGroupMatch(teamsByCode, "CAN", "SUI", startDate.plusDays(4).plusHours(6), "BMO Field", "Toronto", "B", matchNumber++);
        createGroupMatch(teamsByCode, "QAT", "BIH", startDate.plusDays(4).plusHours(9), "BC Place", "Vancouver", "B", matchNumber++);
        createGroupMatch(teamsByCode, "CAN", "BIH", startDate.plusDays(8).plusHours(3), "BMO Field", "Toronto", "B", matchNumber++);
        createGroupMatch(teamsByCode, "SUI", "QAT", startDate.plusDays(8).plusHours(3), "BC Place", "Vancouver", "B", matchNumber++);

        // Group C: Brazil, Morocco, Scotland, Haiti
        createGroupMatch(teamsByCode, "BRA", "HAI", startDate.plusDays(1), "SoFi Stadium", "Los Angeles", "C", matchNumber++);
        createGroupMatch(teamsByCode, "MAR", "SCO", startDate.plusDays(1).plusHours(6), "Hard Rock Stadium", "Miami", "C", matchNumber++);
        createGroupMatch(teamsByCode, "BRA", "MAR", startDate.plusDays(5), "SoFi Stadium", "Los Angeles", "C", matchNumber++);
        createGroupMatch(teamsByCode, "HAI", "SCO", startDate.plusDays(5).plusHours(3), "Hard Rock Stadium", "Miami", "C", matchNumber++);
        createGroupMatch(teamsByCode, "BRA", "SCO", startDate.plusDays(9), "MetLife Stadium", "New Jersey", "C", matchNumber++);
        createGroupMatch(teamsByCode, "MAR", "HAI", startDate.plusDays(9), "Hard Rock Stadium", "Miami", "C", matchNumber++);

        // Group D: USA, Paraguay, Australia, Turkey
        createGroupMatch(teamsByCode, "USA", "PAR", startDate.plusDays(1).plusHours(3), "MetLife Stadium", "New Jersey", "D", matchNumber++);
        createGroupMatch(teamsByCode, "AUS", "TUR", startDate.plusDays(1).plusHours(9), "Levi's Stadium", "Santa Clara", "D", matchNumber++);
        createGroupMatch(teamsByCode, "USA", "AUS", startDate.plusDays(5).plusHours(6), "MetLife Stadium", "New Jersey", "D", matchNumber++);
        createGroupMatch(teamsByCode, "PAR", "TUR", startDate.plusDays(5).plusHours(9), "Levi's Stadium", "Santa Clara", "D", matchNumber++);
        createGroupMatch(teamsByCode, "USA", "TUR", startDate.plusDays(9).plusHours(6), "SoFi Stadium", "Los Angeles", "D", matchNumber++);
        createGroupMatch(teamsByCode, "AUS", "PAR", startDate.plusDays(9).plusHours(6), "Levi's Stadium", "Santa Clara", "D", matchNumber++);

        // Group E: Germany, Ecuador, Ivory Coast, Curacao
        createGroupMatch(teamsByCode, "GER", "CUW", startDate.plusDays(2), "Lincoln Financial Field", "Philadelphia", "E", matchNumber++);
        createGroupMatch(teamsByCode, "ECU", "CIV", startDate.plusDays(2).plusHours(6), "Mercedes-Benz Stadium", "Atlanta", "E", matchNumber++);
        createGroupMatch(teamsByCode, "GER", "ECU", startDate.plusDays(6), "Lincoln Financial Field", "Philadelphia", "E", matchNumber++);
        createGroupMatch(teamsByCode, "CUW", "CIV", startDate.plusDays(6).plusHours(3), "Mercedes-Benz Stadium", "Atlanta", "E", matchNumber++);
        createGroupMatch(teamsByCode, "GER", "CIV", startDate.plusDays(10), "MetLife Stadium", "New Jersey", "E", matchNumber++);
        createGroupMatch(teamsByCode, "ECU", "CUW", startDate.plusDays(10), "Mercedes-Benz Stadium", "Atlanta", "E", matchNumber++);

        // Group F: Netherlands, Japan, Tunisia, Sweden
        createGroupMatch(teamsByCode, "NED", "SWE", startDate.plusDays(2).plusHours(3), "Gillette Stadium", "Foxborough", "F", matchNumber++);
        createGroupMatch(teamsByCode, "JPN", "TUN", startDate.plusDays(2).plusHours(9), "Lumen Field", "Seattle", "F", matchNumber++);
        createGroupMatch(teamsByCode, "NED", "JPN", startDate.plusDays(6).plusHours(6), "Gillette Stadium", "Foxborough", "F", matchNumber++);
        createGroupMatch(teamsByCode, "SWE", "TUN", startDate.plusDays(6).plusHours(9), "Lumen Field", "Seattle", "F", matchNumber++);
        createGroupMatch(teamsByCode, "NED", "TUN", startDate.plusDays(10).plusHours(3), "Gillette Stadium", "Foxborough", "F", matchNumber++);
        createGroupMatch(teamsByCode, "JPN", "SWE", startDate.plusDays(10).plusHours(3), "Lumen Field", "Seattle", "F", matchNumber++);

        // Group G: Belgium, Iran, Egypt, New Zealand
        createGroupMatch(teamsByCode, "BEL", "NZL", startDate.plusDays(3), "AT&T Stadium", "Dallas", "G", matchNumber++);
        createGroupMatch(teamsByCode, "IRN", "EGY", startDate.plusDays(3).plusHours(6), "NRG Stadium", "Houston", "G", matchNumber++);
        createGroupMatch(teamsByCode, "BEL", "IRN", startDate.plusDays(7), "AT&T Stadium", "Dallas", "G", matchNumber++);
        createGroupMatch(teamsByCode, "NZL", "EGY", startDate.plusDays(7).plusHours(3), "NRG Stadium", "Houston", "G", matchNumber++);
        createGroupMatch(teamsByCode, "BEL", "EGY", startDate.plusDays(11), "AT&T Stadium", "Dallas", "G", matchNumber++);
        createGroupMatch(teamsByCode, "IRN", "NZL", startDate.plusDays(11), "NRG Stadium", "Houston", "G", matchNumber++);

        // Group H: Spain, Uruguay, Saudi Arabia, Cape Verde
        createGroupMatch(teamsByCode, "ESP", "CPV", startDate.plusDays(3).plusHours(3), "Hard Rock Stadium", "Miami", "H", matchNumber++);
        createGroupMatch(teamsByCode, "URU", "KSA", startDate.plusDays(3).plusHours(9), "SoFi Stadium", "Los Angeles", "H", matchNumber++);
        createGroupMatch(teamsByCode, "ESP", "URU", startDate.plusDays(7).plusHours(6), "Hard Rock Stadium", "Miami", "H", matchNumber++);
        createGroupMatch(teamsByCode, "CPV", "KSA", startDate.plusDays(7).plusHours(9), "SoFi Stadium", "Los Angeles", "H", matchNumber++);
        createGroupMatch(teamsByCode, "ESP", "KSA", startDate.plusDays(11).plusHours(6), "Hard Rock Stadium", "Miami", "H", matchNumber++);
        createGroupMatch(teamsByCode, "URU", "CPV", startDate.plusDays(11).plusHours(6), "SoFi Stadium", "Los Angeles", "H", matchNumber++);

        // Group I: France, Senegal, Norway, Iraq
        createGroupMatch(teamsByCode, "FRA", "IRQ", startDate.plusDays(4), "MetLife Stadium", "New Jersey", "I", matchNumber++);
        createGroupMatch(teamsByCode, "SEN", "NOR", startDate.plusDays(4).plusHours(6), "Lincoln Financial Field", "Philadelphia", "I", matchNumber++);
        createGroupMatch(teamsByCode, "FRA", "SEN", startDate.plusDays(8), "MetLife Stadium", "New Jersey", "I", matchNumber++);
        createGroupMatch(teamsByCode, "IRQ", "NOR", startDate.plusDays(8).plusHours(3), "Lincoln Financial Field", "Philadelphia", "I", matchNumber++);
        createGroupMatch(teamsByCode, "FRA", "NOR", startDate.plusDays(12), "MetLife Stadium", "New Jersey", "I", matchNumber++);
        createGroupMatch(teamsByCode, "SEN", "IRQ", startDate.plusDays(12), "Lincoln Financial Field", "Philadelphia", "I", matchNumber++);

        // Group J: Argentina, Austria, Algeria, Jordan
        createGroupMatch(teamsByCode, "ARG", "JOR", startDate.plusDays(4).plusHours(3), "Hard Rock Stadium", "Miami", "J", matchNumber++);
        createGroupMatch(teamsByCode, "AUT", "ALG", startDate.plusDays(4).plusHours(9), "Mercedes-Benz Stadium", "Atlanta", "J", matchNumber++);
        createGroupMatch(teamsByCode, "ARG", "AUT", startDate.plusDays(8).plusHours(6), "Hard Rock Stadium", "Miami", "J", matchNumber++);
        createGroupMatch(teamsByCode, "JOR", "ALG", startDate.plusDays(8).plusHours(9), "Mercedes-Benz Stadium", "Atlanta", "J", matchNumber++);
        createGroupMatch(teamsByCode, "ARG", "ALG", startDate.plusDays(12).plusHours(3), "Hard Rock Stadium", "Miami", "J", matchNumber++);
        createGroupMatch(teamsByCode, "AUT", "JOR", startDate.plusDays(12).plusHours(3), "Mercedes-Benz Stadium", "Atlanta", "J", matchNumber++);

        // Group K: Portugal, Colombia, Uzbekistan, DR Congo
        createGroupMatch(teamsByCode, "POR", "COD", startDate.plusDays(5), "Levi's Stadium", "Santa Clara", "K", matchNumber++);
        createGroupMatch(teamsByCode, "COL", "UZB", startDate.plusDays(5).plusHours(6), "BC Place", "Vancouver", "K", matchNumber++);
        createGroupMatch(teamsByCode, "POR", "COL", startDate.plusDays(9).plusHours(3), "Levi's Stadium", "Santa Clara", "K", matchNumber++);
        createGroupMatch(teamsByCode, "COD", "UZB", startDate.plusDays(9).plusHours(9), "BC Place", "Vancouver", "K", matchNumber++);
        createGroupMatch(teamsByCode, "POR", "UZB", startDate.plusDays(13), "Levi's Stadium", "Santa Clara", "K", matchNumber++);
        createGroupMatch(teamsByCode, "COL", "COD", startDate.plusDays(13), "BC Place", "Vancouver", "K", matchNumber++);

        // Group L: England, Croatia, Panama, Ghana
        createGroupMatch(teamsByCode, "ENG", "GHA", startDate.plusDays(5).plusHours(3), "SoFi Stadium", "Los Angeles", "L", matchNumber++);
        createGroupMatch(teamsByCode, "CRO", "PAN", startDate.plusDays(5).plusHours(9), "Estadio Azteca", "Mexico City", "L", matchNumber++);
        createGroupMatch(teamsByCode, "ENG", "CRO", startDate.plusDays(9).plusHours(12), "SoFi Stadium", "Los Angeles", "L", matchNumber++);
        createGroupMatch(teamsByCode, "GHA", "PAN", startDate.plusDays(9).plusHours(12), "Estadio Azteca", "Mexico City", "L", matchNumber++);
        createGroupMatch(teamsByCode, "ENG", "PAN", startDate.plusDays(13).plusHours(6), "SoFi Stadium", "Los Angeles", "L", matchNumber++);
        createGroupMatch(teamsByCode, "CRO", "GHA", startDate.plusDays(13).plusHours(6), "Estadio Azteca", "Mexico City", "L", matchNumber++);

        log.info("Initialized {} group stage matches", matchNumber - 1);

        // Initialize knockout matches with placeholder teams
        initializeKnockoutMatches(teamsByCode, startDate, matchNumber);
    }

    private void initializeKnockoutMatches(Map<String, Team> teams, ZonedDateTime groupStageStart, int matchNumber) {
        // Knockout stage starts after group stage (day 15)
        ZonedDateTime knockoutStart = groupStageStart.plusDays(15);

        // Round of 32 (16 matches)
        // 12 group winners + 12 runners-up + 8 best third-place = 32 teams
        // Placeholders: 1A = 1st in Group A, 2B = 2nd in Group B, 3rd = Best 3rd place

        // Round of 32 - Day 15-18
        createKnockoutMatch(knockoutStart, "MetLife Stadium", "New Jersey", Match.Stage.ROUND_OF_32, matchNumber++, "1A", "3rd");
        createKnockoutMatch(knockoutStart.plusHours(4), "AT&T Stadium", "Dallas", Match.Stage.ROUND_OF_32, matchNumber++, "1B", "3rd");
        createKnockoutMatch(knockoutStart.plusHours(8), "SoFi Stadium", "Los Angeles", Match.Stage.ROUND_OF_32, matchNumber++, "1C", "3rd");
        createKnockoutMatch(knockoutStart.plusHours(12), "Hard Rock Stadium", "Miami", Match.Stage.ROUND_OF_32, matchNumber++, "1D", "3rd");

        createKnockoutMatch(knockoutStart.plusDays(1), "Levi's Stadium", "Santa Clara", Match.Stage.ROUND_OF_32, matchNumber++, "1E", "3rd");
        createKnockoutMatch(knockoutStart.plusDays(1).plusHours(4), "NRG Stadium", "Houston", Match.Stage.ROUND_OF_32, matchNumber++, "1F", "3rd");
        createKnockoutMatch(knockoutStart.plusDays(1).plusHours(8), "Mercedes-Benz Stadium", "Atlanta", Match.Stage.ROUND_OF_32, matchNumber++, "1G", "3rd");
        createKnockoutMatch(knockoutStart.plusDays(1).plusHours(12), "Lincoln Financial Field", "Philadelphia", Match.Stage.ROUND_OF_32, matchNumber++, "1H", "3rd");

        createKnockoutMatch(knockoutStart.plusDays(2), "BC Place", "Vancouver", Match.Stage.ROUND_OF_32, matchNumber++, "1I", "2C");
        createKnockoutMatch(knockoutStart.plusDays(2).plusHours(4), "BMO Field", "Toronto", Match.Stage.ROUND_OF_32, matchNumber++, "1J", "2D");
        createKnockoutMatch(knockoutStart.plusDays(2).plusHours(8), "Estadio Azteca", "Mexico City", Match.Stage.ROUND_OF_32, matchNumber++, "1K", "2E");
        createKnockoutMatch(knockoutStart.plusDays(2).plusHours(12), "Gillette Stadium", "Foxborough", Match.Stage.ROUND_OF_32, matchNumber++, "1L", "2F");

        createKnockoutMatch(knockoutStart.plusDays(3), "MetLife Stadium", "New Jersey", Match.Stage.ROUND_OF_32, matchNumber++, "2A", "2G");
        createKnockoutMatch(knockoutStart.plusDays(3).plusHours(4), "AT&T Stadium", "Dallas", Match.Stage.ROUND_OF_32, matchNumber++, "2B", "2H");
        createKnockoutMatch(knockoutStart.plusDays(3).plusHours(8), "SoFi Stadium", "Los Angeles", Match.Stage.ROUND_OF_32, matchNumber++, "2I", "2J");
        createKnockoutMatch(knockoutStart.plusDays(3).plusHours(12), "Hard Rock Stadium", "Miami", Match.Stage.ROUND_OF_32, matchNumber++, "2K", "2L");

        log.info("Initialized Round of 32 matches (teams TBD)");

        // Round of 16 (8 matches) - Day 19-20
        // Winners from Round of 32
        ZonedDateTime r16Start = knockoutStart.plusDays(5);
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
        ZonedDateTime qfStart = knockoutStart.plusDays(8);
        int r16StartNum = matchNumber - 8;
        createKnockoutMatch(qfStart, "MetLife Stadium", "New Jersey", Match.Stage.QUARTERFINAL, matchNumber++, "W" + r16StartNum, "W" + (r16StartNum + 1));
        createKnockoutMatch(qfStart.plusHours(4), "AT&T Stadium", "Dallas", Match.Stage.QUARTERFINAL, matchNumber++, "W" + (r16StartNum + 2), "W" + (r16StartNum + 3));
        createKnockoutMatch(qfStart.plusDays(1), "Hard Rock Stadium", "Miami", Match.Stage.QUARTERFINAL, matchNumber++, "W" + (r16StartNum + 4), "W" + (r16StartNum + 5));
        createKnockoutMatch(qfStart.plusDays(1).plusHours(4), "SoFi Stadium", "Los Angeles", Match.Stage.QUARTERFINAL, matchNumber++, "W" + (r16StartNum + 6), "W" + (r16StartNum + 7));

        log.info("Initialized Quarter-final matches (teams TBD)");

        // Semi-finals (2 matches) - Day 26-27
        ZonedDateTime sfStart = knockoutStart.plusDays(12);
        int qfStartNum = matchNumber - 4;
        createKnockoutMatch(sfStart, "MetLife Stadium", "New Jersey", Match.Stage.SEMIFINAL, matchNumber++, "W" + qfStartNum, "W" + (qfStartNum + 1));
        createKnockoutMatch(sfStart.plusDays(1), "AT&T Stadium", "Dallas", Match.Stage.SEMIFINAL, matchNumber++, "W" + (qfStartNum + 2), "W" + (qfStartNum + 3));

        log.info("Initialized Semi-final matches (teams TBD)");

        // Third place playoff - Day 30
        ZonedDateTime thirdPlaceDate = knockoutStart.plusDays(16);
        int sfStartNum = matchNumber - 2;
        createKnockoutMatch(thirdPlaceDate, "Hard Rock Stadium", "Miami", Match.Stage.THIRD_PLACE, matchNumber++, "L" + sfStartNum, "L" + (sfStartNum + 1));

        log.info("Initialized Third place match (teams TBD)");

        // Final - Day 31
        ZonedDateTime finalDate = knockoutStart.plusDays(17);
        createKnockoutMatch(finalDate, "MetLife Stadium", "New Jersey", Match.Stage.FINAL, matchNumber, "W" + sfStartNum, "W" + (sfStartNum + 1));

        log.info("Initialized Final match (teams TBD)");
    }

    private void createKnockoutMatch(ZonedDateTime date, String venue, String city,
                                      Match.Stage stage, int matchNumber,
                                      String homePlaceholder, String awayPlaceholder) {
        Match match = Match.builder()
                .homeTeam(null)
                .awayTeam(null)
                .homePlaceholder(homePlaceholder)
                .awayPlaceholder(awayPlaceholder)
                .matchDate(date.toInstant())
                .venue(venue)
                .city(city)
                .stage(stage)
                .matchNumber(matchNumber)
                .status(Match.MatchStatus.SCHEDULED)
                .build();
        matchRepository.save(match);
    }

    private void createGroupMatch(Map<String, Team> teams, String homeCode, String awayCode,
                                   ZonedDateTime date, String venue, String city, String group, int matchNumber) {
        Match match = Match.builder()
                .homeTeam(teams.get(homeCode))
                .awayTeam(teams.get(awayCode))
                .matchDate(date.toInstant())
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
