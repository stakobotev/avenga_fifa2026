package com.fifa2026.prode.controller;

import com.fifa2026.prode.dto.RevealEnvelopeDTO;
import com.fifa2026.prode.dto.RevealTeaserDTO;
import com.fifa2026.prode.service.ResultsLockdownService;
import com.fifa2026.prode.service.RevealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Endpoints that stay available while standings are sealed: the lockdown status,
 * a spoiler-free teaser, and the user's personal envelope. Not covered by the
 * results-lockdown interceptor.
 */
@RestController
@RequestMapping("/api/reveal")
@RequiredArgsConstructor
public class RevealController {

    private final RevealService revealService;
    private final ResultsLockdownService lockdownService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        Instant kickoff = lockdownService.getFinalKickoff();
        Map<String, Object> body = new HashMap<>();
        body.put("locked", lockdownService.isLocked());
        body.put("revealed", lockdownService.isRevealed());
        body.put("revealAt", lockdownService.getRevealAt().toString());
        body.put("finalKickoff", kickoff != null ? kickoff.toString() : null);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/teaser")
    public ResponseEntity<RevealTeaserDTO> teaser() {
        return ResponseEntity.ok(revealService.getTeaser());
    }

    @GetMapping("/me")
    public ResponseEntity<RevealEnvelopeDTO> myEnvelope() {
        return ResponseEntity.ok(revealService.getMyEnvelope());
    }
}
