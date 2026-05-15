package com.fifa2026.prode.controller;

import com.fifa2026.prode.dto.UserDTO;
import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

/**
 * Development-only authentication controller for local testing without Azure AD.
 * This controller is only available when running with the 'dev' profile.
 */
@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
@Profile("dev")
@Slf4j
public class DevAuthController {

    private final UserRepository userRepository;

    /**
     * Login as a test user for development purposes.
     * Creates the user if they don't exist.
     */
    @PostMapping("/login")
    public ResponseEntity<UserDTO> devLogin(
            @RequestBody Map<String, String> request,
            HttpSession session) {

        String username = request.getOrDefault("username", "testuser");
        boolean isAdmin = Boolean.parseBoolean(request.getOrDefault("admin", "false"));
        String region = request.get("region");

        User user = userRepository.findByUsername(username)
                .orElseGet(() -> createDevUser(username, isAdmin, region));

        // Update role if requested
        if (isAdmin && user.getRole() != User.Role.ADMIN) {
            user.setRole(User.Role.ADMIN);
            user = userRepository.save(user);
        }

        user.setLastLogin(LocalDateTime.now());
        user = userRepository.save(user);

        // Set up Spring Security authentication
        var authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
        var authentication = new UsernamePasswordAuthenticationToken(
                user.getId(), null, authorities
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Store user ID in session
        session.setAttribute("userId", user.getId());

        log.info("Dev login successful for user: {} (admin: {})", username, isAdmin);

        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    /**
     * Get current authenticated user in dev mode.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    /**
     * Logout in dev mode.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> devLogout(HttpSession session) {
        session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }

    private User createDevUser(String username, boolean isAdmin, String region) {
        User.Region userRegion = User.Region.OTHER;
        if (region != null && !region.isEmpty()) {
            try {
                userRegion = User.Region.valueOf(region.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid region, use OTHER
            }
        }

        User user = User.builder()
                .username(username)
                .email(username + "@dev.local")
                .displayName(username.substring(0, 1).toUpperCase() + username.substring(1))
                .authProvider(User.AuthProvider.LOCAL)
                .role(isAdmin ? User.Role.ADMIN : User.Role.USER)
                .region(userRegion)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Created dev user: {} (region: {})", savedUser.getUsername(), savedUser.getRegion());
        return savedUser;
    }
}
