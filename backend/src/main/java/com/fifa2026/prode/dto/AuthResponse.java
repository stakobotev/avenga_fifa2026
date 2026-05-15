package com.fifa2026.prode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String type;
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String role;

    public AuthResponse(String token, Long id, String username, String email, String displayName, String role) {
        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
    }
}
