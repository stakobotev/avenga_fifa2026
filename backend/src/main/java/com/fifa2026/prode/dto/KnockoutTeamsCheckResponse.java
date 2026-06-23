package com.fifa2026.prode.dto;

import lombok.Data;

/**
 * Teams that currently qualify for a knockout match's two slots, resolved from
 * the external standings (for group-position placeholders like "1A"/"2C") and
 * from finished matches (for "W##"/"L##" placeholders). Either side may be null
 * when it can't be determined yet (e.g. a "3rd" placeholder, or a group/match
 * not yet decided). Nothing is persisted — this is for the admin to preview.
 */
@Data
public class KnockoutTeamsCheckResponse {
    private String homePlaceholder;
    private String awayPlaceholder;

    private Long homeTeamId;
    private String homeTeamCode;
    private String homeTeamName;

    private Long awayTeamId;
    private String awayTeamCode;
    private String awayTeamName;

    private String message;
}
