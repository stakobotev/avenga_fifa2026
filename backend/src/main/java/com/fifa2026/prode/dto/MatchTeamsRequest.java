package com.fifa2026.prode.dto;

import lombok.Data;

/**
 * Admin request to assign real teams to a knockout match whose teams are still
 * placeholders (e.g. "1A", "W73"). Either side may be provided; a null side is
 * left unchanged.
 */
@Data
public class MatchTeamsRequest {
    private Long homeTeamId;
    private Long awayTeamId;
}
