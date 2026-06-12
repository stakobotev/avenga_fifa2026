package com.fifa2026.prode.controller;

import com.fifa2026.prode.dto.StatisticsOverviewDTO;
import com.fifa2026.prode.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/overview")
    public ResponseEntity<StatisticsOverviewDTO> getOverview() {
        return ResponseEntity.ok(statisticsService.getOverview());
    }
}
