package com.fifa2026.prode.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

/**
 * Logs every rejected request (401) with enough context to trace it back to a
 * user — including, for an expired/invalid bearer token, the token's identity
 * and expiry claims. This is what lets us confirm reports like "I saved my
 * prediction but it disappeared": an expired-token POST now leaves a log line
 * instead of vanishing anonymously.
 *
 * The token is decoded WITHOUT validation (it already failed validation) purely
 * to read its claims for logging; it is never trusted.
 */
@Component
@Slf4j
public class LoggingAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("401 Unauthorized: {} {} - no bearer token ({})",
                    method, uri, authException.getMessage());
        } else {
            log.warn("401 Unauthorized: {} {} - rejected token [{}] ({})",
                    method, uri, describeToken(authHeader.substring(7)), authException.getMessage());
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"status\":401,\"message\":\"Unauthorized\"}");
    }

    /** Decode (without validating) the token payload to log who sent it and when it expired. */
    @SuppressWarnings("unchecked")
    private String describeToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return "unparseable";
            }
            byte[] payload = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> claims = objectMapper.readValue(payload, Map.class);

            Object oid = claims.get("oid");
            Object user = claims.getOrDefault("preferred_username",
                    claims.getOrDefault("upn", claims.get("email")));

            String expInfo = "exp=?";
            Object exp = claims.get("exp");
            if (exp instanceof Number) {
                Instant expiry = Instant.ofEpochSecond(((Number) exp).longValue());
                expInfo = String.format("exp=%s%s", expiry,
                        expiry.isBefore(Instant.now()) ? " (EXPIRED)" : "");
            }
            return String.format("oid=%s, user=%s, %s", oid, user, expInfo);
        } catch (Exception e) {
            return "undecodable";
        }
    }
}
