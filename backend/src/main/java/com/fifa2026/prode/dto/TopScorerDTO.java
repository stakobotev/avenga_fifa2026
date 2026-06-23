package com.fifa2026.prode.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A single entry in the external service's top-scorers ranking for the
 * competition. Used by the admin panel to settle the TOP_SCORER bonus.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopScorerDTO {
    private String playerName;
    private String nationality;
    private String teamName;
    private String teamCode;
    private Integer goals;
    private Integer playedMatches;
}
