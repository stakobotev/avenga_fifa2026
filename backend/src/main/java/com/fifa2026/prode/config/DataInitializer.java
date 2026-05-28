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
                        .orElse(72);
                initializeKnockoutMatches(teamsByCode, lastMatchNumber + 1);
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

        // Official FIFA World Cup 2026 Schedule
        // All times in US Eastern Time (ET), stored as UTC Instant
        ZoneId et = ZoneId.of("America/New_York");
        int matchNumber = 1;

        // ===== GROUP A: Mexico, South Korea, South Africa, Czechia =====
        // June 11: Mexico vs South Africa - 3pm ET - Estadio Azteca, Mexico City
        createGroupMatch(teamsByCode, "MEX", "RSA", ZonedDateTime.of(2026, 6, 11, 15, 0, 0, 0, et), "Estadio Azteca", "Mexico City", "A", matchNumber++);
        // June 11: South Korea vs Czechia - 10pm ET - Estadio Akron, Guadalajara
        createGroupMatch(teamsByCode, "KOR", "CZE", ZonedDateTime.of(2026, 6, 11, 22, 0, 0, 0, et), "Estadio Akron", "Guadalajara", "A", matchNumber++);
        // June 18: Czechia vs South Africa - 12pm ET - Mercedes-Benz Stadium, Atlanta
        createGroupMatch(teamsByCode, "CZE", "RSA", ZonedDateTime.of(2026, 6, 18, 12, 0, 0, 0, et), "Mercedes-Benz Stadium", "Atlanta", "A", matchNumber++);
        // June 18: Mexico vs South Korea - 9pm ET - Estadio Akron, Guadalajara
        createGroupMatch(teamsByCode, "MEX", "KOR", ZonedDateTime.of(2026, 6, 18, 21, 0, 0, 0, et), "Estadio Akron", "Guadalajara", "A", matchNumber++);
        // June 24: Czechia vs Mexico - 9pm ET - Estadio Azteca, Mexico City
        createGroupMatch(teamsByCode, "CZE", "MEX", ZonedDateTime.of(2026, 6, 24, 21, 0, 0, 0, et), "Estadio Azteca", "Mexico City", "A", matchNumber++);
        // June 24: South Africa vs South Korea - 9pm ET - Estadio BBVA, Monterrey
        createGroupMatch(teamsByCode, "RSA", "KOR", ZonedDateTime.of(2026, 6, 24, 21, 0, 0, 0, et), "Estadio BBVA", "Monterrey", "A", matchNumber++);

        // ===== GROUP B: Canada, Switzerland, Qatar, Bosnia-Herzegovina =====
        // June 12: Canada vs Bosnia and Herzegovina - 3pm ET - BMO Field, Toronto
        createGroupMatch(teamsByCode, "CAN", "BIH", ZonedDateTime.of(2026, 6, 12, 15, 0, 0, 0, et), "BMO Field", "Toronto", "B", matchNumber++);
        // June 13: Qatar vs Switzerland - 3pm ET - Levi's Stadium, San Francisco
        createGroupMatch(teamsByCode, "QAT", "SUI", ZonedDateTime.of(2026, 6, 13, 15, 0, 0, 0, et), "Levi's Stadium", "San Francisco Bay Area", "B", matchNumber++);
        // June 18: Switzerland vs Bosnia and Herzegovina - 3pm ET - SoFi Stadium, Los Angeles
        createGroupMatch(teamsByCode, "SUI", "BIH", ZonedDateTime.of(2026, 6, 18, 15, 0, 0, 0, et), "SoFi Stadium", "Los Angeles", "B", matchNumber++);
        // June 18: Canada vs Qatar - 6pm ET - BC Place, Vancouver
        createGroupMatch(teamsByCode, "CAN", "QAT", ZonedDateTime.of(2026, 6, 18, 18, 0, 0, 0, et), "BC Place", "Vancouver", "B", matchNumber++);
        // June 24: Switzerland vs Canada - 3pm ET - BC Place, Vancouver
        createGroupMatch(teamsByCode, "SUI", "CAN", ZonedDateTime.of(2026, 6, 24, 15, 0, 0, 0, et), "BC Place", "Vancouver", "B", matchNumber++);
        // June 24: Bosnia and Herzegovina vs Qatar - 3pm ET - Lumen Field, Seattle
        createGroupMatch(teamsByCode, "BIH", "QAT", ZonedDateTime.of(2026, 6, 24, 15, 0, 0, 0, et), "Lumen Field", "Seattle", "B", matchNumber++);

        // ===== GROUP C: Brazil, Morocco, Scotland, Haiti =====
        // June 13: Brazil vs Morocco - 6pm ET - MetLife Stadium, New Jersey
        createGroupMatch(teamsByCode, "BRA", "MAR", ZonedDateTime.of(2026, 6, 13, 18, 0, 0, 0, et), "MetLife Stadium", "New Jersey", "C", matchNumber++);
        // June 13: Haiti vs Scotland - 9pm ET - Gillette Stadium, Boston
        createGroupMatch(teamsByCode, "HAI", "SCO", ZonedDateTime.of(2026, 6, 13, 21, 0, 0, 0, et), "Gillette Stadium", "Boston", "C", matchNumber++);
        // June 19: Scotland vs Morocco - 6pm ET - Gillette Stadium, Boston
        createGroupMatch(teamsByCode, "SCO", "MAR", ZonedDateTime.of(2026, 6, 19, 18, 0, 0, 0, et), "Gillette Stadium", "Boston", "C", matchNumber++);
        // June 19: Brazil vs Haiti - 9pm ET - Lincoln Financial Field, Philadelphia
        createGroupMatch(teamsByCode, "BRA", "HAI", ZonedDateTime.of(2026, 6, 19, 21, 0, 0, 0, et), "Lincoln Financial Field", "Philadelphia", "C", matchNumber++);
        // June 24: Scotland vs Brazil - 6pm ET - Hard Rock Stadium, Miami
        createGroupMatch(teamsByCode, "SCO", "BRA", ZonedDateTime.of(2026, 6, 24, 18, 0, 0, 0, et), "Hard Rock Stadium", "Miami", "C", matchNumber++);
        // June 24: Morocco vs Haiti - 6pm ET - Mercedes-Benz Stadium, Atlanta
        createGroupMatch(teamsByCode, "MAR", "HAI", ZonedDateTime.of(2026, 6, 24, 18, 0, 0, 0, et), "Mercedes-Benz Stadium", "Atlanta", "C", matchNumber++);

        // ===== GROUP D: USA, Paraguay, Australia, Turkey =====
        // June 12: USA vs Paraguay - 9pm ET - SoFi Stadium, Los Angeles
        createGroupMatch(teamsByCode, "USA", "PAR", ZonedDateTime.of(2026, 6, 12, 21, 0, 0, 0, et), "SoFi Stadium", "Los Angeles", "D", matchNumber++);
        // June 13: Australia vs Turkey - 12am ET (midnight) - BC Place, Vancouver
        createGroupMatch(teamsByCode, "AUS", "TUR", ZonedDateTime.of(2026, 6, 14, 0, 0, 0, 0, et), "BC Place", "Vancouver", "D", matchNumber++);
        // June 19: USA vs Australia - 3pm ET - Lumen Field, Seattle
        createGroupMatch(teamsByCode, "USA", "AUS", ZonedDateTime.of(2026, 6, 19, 15, 0, 0, 0, et), "Lumen Field", "Seattle", "D", matchNumber++);
        // June 19: Turkey vs Paraguay - 12am ET (midnight, June 20) - Levi's Stadium, San Francisco
        createGroupMatch(teamsByCode, "TUR", "PAR", ZonedDateTime.of(2026, 6, 20, 0, 0, 0, 0, et), "Levi's Stadium", "San Francisco Bay Area", "D", matchNumber++);
        // June 25: Turkey vs USA - 10pm ET - SoFi Stadium, Los Angeles
        createGroupMatch(teamsByCode, "TUR", "USA", ZonedDateTime.of(2026, 6, 25, 22, 0, 0, 0, et), "SoFi Stadium", "Los Angeles", "D", matchNumber++);
        // June 25: Paraguay vs Australia - 10pm ET - Levi's Stadium, San Francisco
        createGroupMatch(teamsByCode, "PAR", "AUS", ZonedDateTime.of(2026, 6, 25, 22, 0, 0, 0, et), "Levi's Stadium", "San Francisco Bay Area", "D", matchNumber++);

        // ===== GROUP E: Germany, Ecuador, Ivory Coast, Curacao =====
        // June 14: Germany vs Curacao - 1pm ET - NRG Stadium, Houston
        createGroupMatch(teamsByCode, "GER", "CUW", ZonedDateTime.of(2026, 6, 14, 13, 0, 0, 0, et), "NRG Stadium", "Houston", "E", matchNumber++);
        // June 14: Ivory Coast vs Ecuador - 7pm ET - Lincoln Financial Field, Philadelphia
        createGroupMatch(teamsByCode, "CIV", "ECU", ZonedDateTime.of(2026, 6, 14, 19, 0, 0, 0, et), "Lincoln Financial Field", "Philadelphia", "E", matchNumber++);
        // June 20: Germany vs Ivory Coast - 4pm ET - BMO Field, Toronto
        createGroupMatch(teamsByCode, "GER", "CIV", ZonedDateTime.of(2026, 6, 20, 16, 0, 0, 0, et), "BMO Field", "Toronto", "E", matchNumber++);
        // June 20: Ecuador vs Curacao - 8pm ET - Arrowhead Stadium, Kansas City
        createGroupMatch(teamsByCode, "ECU", "CUW", ZonedDateTime.of(2026, 6, 20, 20, 0, 0, 0, et), "Arrowhead Stadium", "Kansas City", "E", matchNumber++);
        // June 25: Ecuador vs Germany - 4pm ET - MetLife Stadium, New Jersey
        createGroupMatch(teamsByCode, "ECU", "GER", ZonedDateTime.of(2026, 6, 25, 16, 0, 0, 0, et), "MetLife Stadium", "New Jersey", "E", matchNumber++);
        // June 25: Curacao vs Ivory Coast - 4pm ET - Lincoln Financial Field, Philadelphia
        createGroupMatch(teamsByCode, "CUW", "CIV", ZonedDateTime.of(2026, 6, 25, 16, 0, 0, 0, et), "Lincoln Financial Field", "Philadelphia", "E", matchNumber++);

        // ===== GROUP F: Netherlands, Japan, Tunisia, Sweden =====
        // June 14: Netherlands vs Japan - 4pm ET - AT&T Stadium, Dallas
        createGroupMatch(teamsByCode, "NED", "JPN", ZonedDateTime.of(2026, 6, 14, 16, 0, 0, 0, et), "AT&T Stadium", "Dallas", "F", matchNumber++);
        // June 14: Sweden vs Tunisia - 10pm ET - Estadio BBVA, Monterrey
        createGroupMatch(teamsByCode, "SWE", "TUN", ZonedDateTime.of(2026, 6, 14, 22, 0, 0, 0, et), "Estadio BBVA", "Monterrey", "F", matchNumber++);
        // June 20: Netherlands vs Sweden - 1pm ET - NRG Stadium, Houston
        createGroupMatch(teamsByCode, "NED", "SWE", ZonedDateTime.of(2026, 6, 20, 13, 0, 0, 0, et), "NRG Stadium", "Houston", "F", matchNumber++);
        // June 20: Tunisia vs Japan - 12am ET (midnight, June 21) - Estadio BBVA, Monterrey
        createGroupMatch(teamsByCode, "TUN", "JPN", ZonedDateTime.of(2026, 6, 21, 0, 0, 0, 0, et), "Estadio BBVA", "Monterrey", "F", matchNumber++);
        // June 25: Japan vs Sweden - 7pm ET - AT&T Stadium, Dallas
        createGroupMatch(teamsByCode, "JPN", "SWE", ZonedDateTime.of(2026, 6, 25, 19, 0, 0, 0, et), "AT&T Stadium", "Dallas", "F", matchNumber++);
        // June 25: Tunisia vs Netherlands - 7pm ET - Arrowhead Stadium, Kansas City
        createGroupMatch(teamsByCode, "TUN", "NED", ZonedDateTime.of(2026, 6, 25, 19, 0, 0, 0, et), "Arrowhead Stadium", "Kansas City", "F", matchNumber++);

        // ===== GROUP G: Belgium, Iran, Egypt, New Zealand =====
        // June 15: Belgium vs Egypt - 3pm ET - Lumen Field, Seattle
        createGroupMatch(teamsByCode, "BEL", "EGY", ZonedDateTime.of(2026, 6, 15, 15, 0, 0, 0, et), "Lumen Field", "Seattle", "G", matchNumber++);
        // June 15: Iran vs New Zealand - 9pm ET - SoFi Stadium, Los Angeles
        createGroupMatch(teamsByCode, "IRN", "NZL", ZonedDateTime.of(2026, 6, 15, 21, 0, 0, 0, et), "SoFi Stadium", "Los Angeles", "G", matchNumber++);
        // June 21: Belgium vs Iran - 3pm ET - SoFi Stadium, Los Angeles
        createGroupMatch(teamsByCode, "BEL", "IRN", ZonedDateTime.of(2026, 6, 21, 15, 0, 0, 0, et), "SoFi Stadium", "Los Angeles", "G", matchNumber++);
        // June 21: New Zealand vs Egypt - 9pm ET - BC Place, Vancouver
        createGroupMatch(teamsByCode, "NZL", "EGY", ZonedDateTime.of(2026, 6, 21, 21, 0, 0, 0, et), "BC Place", "Vancouver", "G", matchNumber++);
        // June 26: Egypt vs Iran - 11pm ET - Lumen Field, Seattle
        createGroupMatch(teamsByCode, "EGY", "IRN", ZonedDateTime.of(2026, 6, 26, 23, 0, 0, 0, et), "Lumen Field", "Seattle", "G", matchNumber++);
        // June 26: New Zealand vs Belgium - 11pm ET - BC Place, Vancouver
        createGroupMatch(teamsByCode, "NZL", "BEL", ZonedDateTime.of(2026, 6, 26, 23, 0, 0, 0, et), "BC Place", "Vancouver", "G", matchNumber++);

        // ===== GROUP H: Spain, Uruguay, Saudi Arabia, Cape Verde =====
        // June 15: Spain vs Cape Verde - 12pm ET - Mercedes-Benz Stadium, Atlanta
        createGroupMatch(teamsByCode, "ESP", "CPV", ZonedDateTime.of(2026, 6, 15, 12, 0, 0, 0, et), "Mercedes-Benz Stadium", "Atlanta", "H", matchNumber++);
        // June 15: Saudi Arabia vs Uruguay - 6pm ET - Hard Rock Stadium, Miami
        createGroupMatch(teamsByCode, "KSA", "URU", ZonedDateTime.of(2026, 6, 15, 18, 0, 0, 0, et), "Hard Rock Stadium", "Miami", "H", matchNumber++);
        // June 21: Spain vs Saudi Arabia - 12pm ET - Mercedes-Benz Stadium, Atlanta
        createGroupMatch(teamsByCode, "ESP", "KSA", ZonedDateTime.of(2026, 6, 21, 12, 0, 0, 0, et), "Mercedes-Benz Stadium", "Atlanta", "H", matchNumber++);
        // June 21: Uruguay vs Cape Verde - 6pm ET - Hard Rock Stadium, Miami
        createGroupMatch(teamsByCode, "URU", "CPV", ZonedDateTime.of(2026, 6, 21, 18, 0, 0, 0, et), "Hard Rock Stadium", "Miami", "H", matchNumber++);
        // June 26: Cape Verde vs Saudi Arabia - 8pm ET - NRG Stadium, Houston
        createGroupMatch(teamsByCode, "CPV", "KSA", ZonedDateTime.of(2026, 6, 26, 20, 0, 0, 0, et), "NRG Stadium", "Houston", "H", matchNumber++);
        // June 26: Uruguay vs Spain - 8pm ET - Estadio Akron, Guadalajara
        createGroupMatch(teamsByCode, "URU", "ESP", ZonedDateTime.of(2026, 6, 26, 20, 0, 0, 0, et), "Estadio Akron", "Guadalajara", "H", matchNumber++);

        // ===== GROUP I: France, Senegal, Norway, Iraq =====
        // June 16: France vs Senegal - 3pm ET - MetLife Stadium, New Jersey
        createGroupMatch(teamsByCode, "FRA", "SEN", ZonedDateTime.of(2026, 6, 16, 15, 0, 0, 0, et), "MetLife Stadium", "New Jersey", "I", matchNumber++);
        // June 16: Iraq vs Norway - 6pm ET - Gillette Stadium, Boston
        createGroupMatch(teamsByCode, "IRQ", "NOR", ZonedDateTime.of(2026, 6, 16, 18, 0, 0, 0, et), "Gillette Stadium", "Boston", "I", matchNumber++);
        // June 22: France vs Iraq - 5pm ET - Lincoln Financial Field, Philadelphia
        createGroupMatch(teamsByCode, "FRA", "IRQ", ZonedDateTime.of(2026, 6, 22, 17, 0, 0, 0, et), "Lincoln Financial Field", "Philadelphia", "I", matchNumber++);
        // June 22: Norway vs Senegal - 8pm ET - MetLife Stadium, New Jersey
        createGroupMatch(teamsByCode, "NOR", "SEN", ZonedDateTime.of(2026, 6, 22, 20, 0, 0, 0, et), "MetLife Stadium", "New Jersey", "I", matchNumber++);
        // June 26: Norway vs France - 3pm ET - Gillette Stadium, Boston
        createGroupMatch(teamsByCode, "NOR", "FRA", ZonedDateTime.of(2026, 6, 26, 15, 0, 0, 0, et), "Gillette Stadium", "Boston", "I", matchNumber++);
        // June 26: Senegal vs Iraq - 3pm ET - BMO Field, Toronto
        createGroupMatch(teamsByCode, "SEN", "IRQ", ZonedDateTime.of(2026, 6, 26, 15, 0, 0, 0, et), "BMO Field", "Toronto", "I", matchNumber++);

        // ===== GROUP J: Argentina, Austria, Algeria, Jordan =====
        // June 16: Argentina vs Algeria - 9pm ET - Arrowhead Stadium, Kansas City
        createGroupMatch(teamsByCode, "ARG", "ALG", ZonedDateTime.of(2026, 6, 16, 21, 0, 0, 0, et), "Arrowhead Stadium", "Kansas City", "J", matchNumber++);
        // June 16: Austria vs Jordan - 12am ET (midnight, June 17) - Levi's Stadium, San Francisco
        createGroupMatch(teamsByCode, "AUT", "JOR", ZonedDateTime.of(2026, 6, 17, 0, 0, 0, 0, et), "Levi's Stadium", "San Francisco Bay Area", "J", matchNumber++);
        // June 22: Argentina vs Austria - 1pm ET - AT&T Stadium, Dallas
        createGroupMatch(teamsByCode, "ARG", "AUT", ZonedDateTime.of(2026, 6, 22, 13, 0, 0, 0, et), "AT&T Stadium", "Dallas", "J", matchNumber++);
        // June 22: Jordan vs Algeria - 11pm ET - Levi's Stadium, San Francisco
        createGroupMatch(teamsByCode, "JOR", "ALG", ZonedDateTime.of(2026, 6, 22, 23, 0, 0, 0, et), "Levi's Stadium", "San Francisco Bay Area", "J", matchNumber++);
        // June 27: Algeria vs Austria - 10pm ET - Arrowhead Stadium, Kansas City
        createGroupMatch(teamsByCode, "ALG", "AUT", ZonedDateTime.of(2026, 6, 27, 22, 0, 0, 0, et), "Arrowhead Stadium", "Kansas City", "J", matchNumber++);
        // June 27: Jordan vs Argentina - 10pm ET - AT&T Stadium, Dallas
        createGroupMatch(teamsByCode, "JOR", "ARG", ZonedDateTime.of(2026, 6, 27, 22, 0, 0, 0, et), "AT&T Stadium", "Dallas", "J", matchNumber++);

        // ===== GROUP K: Portugal, Colombia, Uzbekistan, DR Congo =====
        // June 17: Portugal vs DR Congo - 1pm ET - NRG Stadium, Houston
        createGroupMatch(teamsByCode, "POR", "COD", ZonedDateTime.of(2026, 6, 17, 13, 0, 0, 0, et), "NRG Stadium", "Houston", "K", matchNumber++);
        // June 17: Uzbekistan vs Colombia - 10pm ET - Estadio Azteca, Mexico City
        createGroupMatch(teamsByCode, "UZB", "COL", ZonedDateTime.of(2026, 6, 17, 22, 0, 0, 0, et), "Estadio Azteca", "Mexico City", "K", matchNumber++);
        // June 23: Portugal vs Uzbekistan - 1pm ET - NRG Stadium, Houston
        createGroupMatch(teamsByCode, "POR", "UZB", ZonedDateTime.of(2026, 6, 23, 13, 0, 0, 0, et), "NRG Stadium", "Houston", "K", matchNumber++);
        // June 23: Colombia vs DR Congo - 10pm ET - Estadio Akron, Guadalajara
        createGroupMatch(teamsByCode, "COL", "COD", ZonedDateTime.of(2026, 6, 23, 22, 0, 0, 0, et), "Estadio Akron", "Guadalajara", "K", matchNumber++);
        // June 27: Colombia vs Portugal - 7:30pm ET - Hard Rock Stadium, Miami
        createGroupMatch(teamsByCode, "COL", "POR", ZonedDateTime.of(2026, 6, 27, 19, 30, 0, 0, et), "Hard Rock Stadium", "Miami", "K", matchNumber++);
        // June 27: DR Congo vs Uzbekistan - 7:30pm ET - Mercedes-Benz Stadium, Atlanta
        createGroupMatch(teamsByCode, "COD", "UZB", ZonedDateTime.of(2026, 6, 27, 19, 30, 0, 0, et), "Mercedes-Benz Stadium", "Atlanta", "K", matchNumber++);

        // ===== GROUP L: England, Croatia, Panama, Ghana =====
        // June 17: England vs Croatia - 4pm ET - AT&T Stadium, Dallas
        createGroupMatch(teamsByCode, "ENG", "CRO", ZonedDateTime.of(2026, 6, 17, 16, 0, 0, 0, et), "AT&T Stadium", "Dallas", "L", matchNumber++);
        // June 17: Ghana vs Panama - 7pm ET - BMO Field, Toronto
        createGroupMatch(teamsByCode, "GHA", "PAN", ZonedDateTime.of(2026, 6, 17, 19, 0, 0, 0, et), "BMO Field", "Toronto", "L", matchNumber++);
        // June 23: England vs Ghana - 4pm ET - Gillette Stadium, Boston
        createGroupMatch(teamsByCode, "ENG", "GHA", ZonedDateTime.of(2026, 6, 23, 16, 0, 0, 0, et), "Gillette Stadium", "Boston", "L", matchNumber++);
        // June 23: Panama vs Croatia - 7pm ET - BMO Field, Toronto
        createGroupMatch(teamsByCode, "PAN", "CRO", ZonedDateTime.of(2026, 6, 23, 19, 0, 0, 0, et), "BMO Field", "Toronto", "L", matchNumber++);
        // June 27: Panama vs England - 5pm ET - MetLife Stadium, New Jersey
        createGroupMatch(teamsByCode, "PAN", "ENG", ZonedDateTime.of(2026, 6, 27, 17, 0, 0, 0, et), "MetLife Stadium", "New Jersey", "L", matchNumber++);
        // June 27: Croatia vs Ghana - 5pm ET - Lincoln Financial Field, Philadelphia
        createGroupMatch(teamsByCode, "CRO", "GHA", ZonedDateTime.of(2026, 6, 27, 17, 0, 0, 0, et), "Lincoln Financial Field", "Philadelphia", "L", matchNumber++);

        log.info("Initialized {} group stage matches", matchNumber - 1);

        // Initialize knockout matches with placeholder teams
        initializeKnockoutMatches(teamsByCode, matchNumber);
    }

    private void initializeKnockoutMatches(Map<String, Team> teams, int matchNumber) {
        // Official FIFA World Cup 2026 Knockout Stage Schedule
        // All times in US Eastern Time (ET)
        ZoneId et = ZoneId.of("America/New_York");

        // Round of 32: June 28 - July 3 (16 matches)
        // Placeholders: 1A = 1st in Group A, 2B = 2nd in Group B, 3rd = Best 3rd place

        // June 28 - Round of 32 Day 1
        createKnockoutMatch(ZonedDateTime.of(2026, 6, 28, 12, 0, 0, 0, et), "MetLife Stadium", "New Jersey", Match.Stage.ROUND_OF_32, matchNumber++, "1A", "3rd");
        createKnockoutMatch(ZonedDateTime.of(2026, 6, 28, 16, 0, 0, 0, et), "AT&T Stadium", "Dallas", Match.Stage.ROUND_OF_32, matchNumber++, "1B", "3rd");
        createKnockoutMatch(ZonedDateTime.of(2026, 6, 28, 20, 0, 0, 0, et), "SoFi Stadium", "Los Angeles", Match.Stage.ROUND_OF_32, matchNumber++, "1C", "3rd");

        // June 29 - Round of 32 Day 2
        createKnockoutMatch(ZonedDateTime.of(2026, 6, 29, 12, 0, 0, 0, et), "Hard Rock Stadium", "Miami", Match.Stage.ROUND_OF_32, matchNumber++, "1D", "3rd");
        createKnockoutMatch(ZonedDateTime.of(2026, 6, 29, 16, 0, 0, 0, et), "Levi's Stadium", "San Francisco Bay Area", Match.Stage.ROUND_OF_32, matchNumber++, "1E", "3rd");
        createKnockoutMatch(ZonedDateTime.of(2026, 6, 29, 20, 0, 0, 0, et), "NRG Stadium", "Houston", Match.Stage.ROUND_OF_32, matchNumber++, "1F", "3rd");

        // June 30 - Round of 32 Day 3
        createKnockoutMatch(ZonedDateTime.of(2026, 6, 30, 12, 0, 0, 0, et), "Mercedes-Benz Stadium", "Atlanta", Match.Stage.ROUND_OF_32, matchNumber++, "1G", "3rd");
        createKnockoutMatch(ZonedDateTime.of(2026, 6, 30, 16, 0, 0, 0, et), "Lincoln Financial Field", "Philadelphia", Match.Stage.ROUND_OF_32, matchNumber++, "1H", "3rd");
        createKnockoutMatch(ZonedDateTime.of(2026, 6, 30, 20, 0, 0, 0, et), "BC Place", "Vancouver", Match.Stage.ROUND_OF_32, matchNumber++, "1I", "2C");

        // July 1 - Round of 32 Day 4
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 1, 12, 0, 0, 0, et), "BMO Field", "Toronto", Match.Stage.ROUND_OF_32, matchNumber++, "1J", "2D");
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 1, 16, 0, 0, 0, et), "Estadio Azteca", "Mexico City", Match.Stage.ROUND_OF_32, matchNumber++, "1K", "2E");
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 1, 20, 0, 0, 0, et), "Gillette Stadium", "Boston", Match.Stage.ROUND_OF_32, matchNumber++, "1L", "2F");

        // July 2 - Round of 32 Day 5
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 2, 12, 0, 0, 0, et), "MetLife Stadium", "New Jersey", Match.Stage.ROUND_OF_32, matchNumber++, "2A", "2G");
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 2, 16, 0, 0, 0, et), "AT&T Stadium", "Dallas", Match.Stage.ROUND_OF_32, matchNumber++, "2B", "2H");

        // July 3 - Round of 32 Day 6
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 3, 16, 0, 0, 0, et), "SoFi Stadium", "Los Angeles", Match.Stage.ROUND_OF_32, matchNumber++, "2I", "2J");
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 3, 20, 0, 0, 0, et), "Hard Rock Stadium", "Miami", Match.Stage.ROUND_OF_32, matchNumber++, "2K", "2L");

        log.info("Initialized Round of 32 matches (teams TBD)");

        // Round of 16: July 4-7 (8 matches)
        int r32Start = matchNumber - 16;

        // July 4 - Round of 16 Day 1 (US Independence Day)
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 4, 13, 0, 0, 0, et), "Lincoln Financial Field", "Philadelphia", Match.Stage.ROUND_OF_16, matchNumber++, "W" + r32Start, "W" + (r32Start + 1));
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 4, 17, 0, 0, 0, et), "NRG Stadium", "Houston", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 2), "W" + (r32Start + 3));

        // July 5 - Round of 16 Day 2
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 5, 13, 0, 0, 0, et), "MetLife Stadium", "New Jersey", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 4), "W" + (r32Start + 5));
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 5, 17, 0, 0, 0, et), "AT&T Stadium", "Dallas", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 6), "W" + (r32Start + 7));

        // July 6 - Round of 16 Day 3
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 6, 13, 0, 0, 0, et), "Hard Rock Stadium", "Miami", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 8), "W" + (r32Start + 9));
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 6, 17, 0, 0, 0, et), "SoFi Stadium", "Los Angeles", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 10), "W" + (r32Start + 11));

        // July 7 - Round of 16 Day 4
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 7, 13, 0, 0, 0, et), "Mercedes-Benz Stadium", "Atlanta", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 12), "W" + (r32Start + 13));
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 7, 17, 0, 0, 0, et), "Levi's Stadium", "San Francisco Bay Area", Match.Stage.ROUND_OF_16, matchNumber++, "W" + (r32Start + 14), "W" + (r32Start + 15));

        log.info("Initialized Round of 16 matches (teams TBD)");

        // Quarter-finals: July 9-12 (4 matches)
        int r16StartNum = matchNumber - 8;

        // July 9
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 9, 16, 0, 0, 0, et), "MetLife Stadium", "New Jersey", Match.Stage.QUARTERFINAL, matchNumber++, "W" + r16StartNum, "W" + (r16StartNum + 1));

        // July 10
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 10, 16, 0, 0, 0, et), "AT&T Stadium", "Dallas", Match.Stage.QUARTERFINAL, matchNumber++, "W" + (r16StartNum + 2), "W" + (r16StartNum + 3));

        // July 11
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 11, 16, 0, 0, 0, et), "Hard Rock Stadium", "Miami", Match.Stage.QUARTERFINAL, matchNumber++, "W" + (r16StartNum + 4), "W" + (r16StartNum + 5));

        // July 12
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 12, 16, 0, 0, 0, et), "SoFi Stadium", "Los Angeles", Match.Stage.QUARTERFINAL, matchNumber++, "W" + (r16StartNum + 6), "W" + (r16StartNum + 7));

        log.info("Initialized Quarter-final matches (teams TBD)");

        // Semi-finals: July 14-15 (2 matches)
        int qfStartNum = matchNumber - 4;

        // July 14
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 14, 17, 0, 0, 0, et), "MetLife Stadium", "New Jersey", Match.Stage.SEMIFINAL, matchNumber++, "W" + qfStartNum, "W" + (qfStartNum + 1));

        // July 15
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 15, 17, 0, 0, 0, et), "AT&T Stadium", "Dallas", Match.Stage.SEMIFINAL, matchNumber++, "W" + (qfStartNum + 2), "W" + (qfStartNum + 3));

        log.info("Initialized Semi-final matches (teams TBD)");

        // Third place playoff: July 18
        int sfStartNum = matchNumber - 2;
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 18, 16, 0, 0, 0, et), "Hard Rock Stadium", "Miami", Match.Stage.THIRD_PLACE, matchNumber++, "L" + sfStartNum, "L" + (sfStartNum + 1));

        log.info("Initialized Third place match (teams TBD)");

        // Final: July 19
        createKnockoutMatch(ZonedDateTime.of(2026, 7, 19, 16, 0, 0, 0, et), "MetLife Stadium", "New Jersey", Match.Stage.FINAL, matchNumber, "W" + sfStartNum, "W" + (sfStartNum + 1));

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
