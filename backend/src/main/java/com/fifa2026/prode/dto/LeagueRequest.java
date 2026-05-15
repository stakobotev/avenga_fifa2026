package com.fifa2026.prode.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LeagueRequest {
    @NotBlank(message = "League name is required")
    @Size(min = 3, max = 100, message = "League name must be between 3 and 100 characters")
    private String name;

    private String description;

    private boolean isPrivate = true;

    private String prizes;
}
