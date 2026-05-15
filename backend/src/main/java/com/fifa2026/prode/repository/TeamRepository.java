package com.fifa2026.prode.repository;

import com.fifa2026.prode.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByCode(String code);
    Optional<Team> findByName(String name);
    List<Team> findByGroupLetterOrderByName(String groupLetter);
    List<Team> findAllByOrderByGroupLetterAscNameAsc();
}
