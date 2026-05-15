package com.fifa2026.prode.service;

import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service to get the current authenticated user.
 * Works with both OAuth2 JWT (prod) and session-based auth (dev).
 */
@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;
    private final HttpServletRequest request;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Not authenticated");
        }

        Object principal = authentication.getPrincipal();

        // OAuth2 JWT authentication (prod mode)
        if (principal instanceof Jwt jwt) {
            String azureAdId = jwt.getClaimAsString("oid");
            return userRepository.findByAzureAdId(azureAdId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        // Session-based authentication (dev mode)
        if (principal instanceof Long userId) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        // Try session attribute as fallback
        HttpSession session = request.getSession(false);
        if (session != null) {
            Long userId = (Long) session.getAttribute("userId");
            if (userId != null) {
                return userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
            }
        }

        throw new RuntimeException("Unable to determine current user");
    }

    public Optional<User> getCurrentUserOptional() {
        try {
            return Optional.of(getCurrentUser());
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
