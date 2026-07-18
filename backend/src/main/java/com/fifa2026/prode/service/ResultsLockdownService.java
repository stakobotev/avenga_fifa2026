package com.fifa2026.prode.service;

import com.fifa2026.prode.entity.Match;
import com.fifa2026.prode.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Owns the "results are sealed" window. Between the final match kickoff and the
 * public reveal, regular users are locked out of anything that exposes standings;
 * admins are never affected. Kept in sync with the frontend config/reveal.ts.
 */
@Service
@RequiredArgsConstructor
public class ResultsLockdownService {

    // Standings are unsealed for everyone at 17:00 EEST (UTC+3) on 21 Jul 2026.
    public static final Instant REVEAL_AT = Instant.parse("2026-07-21T14:00:00Z");

    private final MatchRepository matchRepository;

    /** Kickoff of the final match, or null if it isn't scheduled yet. */
    public Instant getFinalKickoff() {
        List<Match> finals = matchRepository.findByStageOrderByMatchDateAsc(Match.Stage.FINAL);
        Instant kickoff = null;
        for (Match m : finals) {
            if (m.getMatchDate() == null) continue;
            if (kickoff == null || m.getMatchDate().isAfter(kickoff)) {
                kickoff = m.getMatchDate();
            }
        }
        return kickoff;
    }

    public Instant getRevealAt() {
        return REVEAL_AT;
    }

    public boolean isRevealed() {
        return !Instant.now().isBefore(REVEAL_AT);
    }

    /** True while the final has kicked off but the results have not been revealed. */
    public boolean isLocked() {
        Instant now = Instant.now();
        if (!now.isBefore(REVEAL_AT)) return false;        // already revealed
        Instant kickoff = getFinalKickoff();
        return kickoff != null && !now.isBefore(kickoff);  // now >= final kickoff
    }
}
