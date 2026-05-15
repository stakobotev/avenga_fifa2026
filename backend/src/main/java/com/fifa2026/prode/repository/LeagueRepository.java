package com.fifa2026.prode.repository;

import com.fifa2026.prode.entity.League;
import com.fifa2026.prode.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeagueRepository extends JpaRepository<League, Long> {
    Optional<League> findByInviteCode(String inviteCode);

    List<League> findByOwner(User owner);

    @Query("SELECT l FROM League l JOIN l.members m WHERE m = :user")
    List<League> findByMember(@Param("user") User user);

    @Query("SELECT l FROM League l WHERE l.isPrivate = false ORDER BY l.createdAt DESC")
    List<League> findPublicLeagues();

    boolean existsByInviteCode(String inviteCode);
}
