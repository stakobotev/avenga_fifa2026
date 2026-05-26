package com.fifa2026.prode.repository;

import com.fifa2026.prode.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByStageOrderByMatchDateAsc(Match.Stage stage);

    List<Match> findByGroupLetterOrderByMatchDateAsc(String groupLetter);

    List<Match> findAllByOrderByMatchDateAsc();

    List<Match> findByStatusOrderByMatchDateAsc(Match.MatchStatus status);

    @Query("SELECT m FROM Match m WHERE m.matchDate > :now ORDER BY m.matchDate ASC")
    List<Match> findUpcomingMatches(@Param("now") Instant now);

    @Query("SELECT m FROM Match m WHERE m.matchDate <= :now AND m.status = 'SCHEDULED' ORDER BY m.matchDate ASC")
    List<Match> findMatchesToLock(@Param("now") Instant now);

    @Query("SELECT m FROM Match m WHERE m.status = 'FINISHED' AND m.stage != 'GROUP' ORDER BY m.matchDate DESC")
    List<Match> findFinishedKnockoutMatches();

    List<Match> findByMatchDateBetweenOrderByMatchDateAsc(Instant start, Instant end);

    // For external API sync
    Optional<Match> findByExternalApiId(Long externalApiId);

    List<Match> findByStatusAndMatchDateBefore(Match.MatchStatus status, Instant before);
}
