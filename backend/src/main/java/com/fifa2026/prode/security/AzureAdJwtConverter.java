package com.fifa2026.prode.security;

import com.fifa2026.prode.entity.User;
import com.fifa2026.prode.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AzureAdJwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        User user = provisionOrUpdateUser(jwt);
        Collection<GrantedAuthority> authorities = extractAuthorities(user);

        return new JwtAuthenticationToken(jwt, authorities, user.getUsername());
    }

    private User provisionOrUpdateUser(Jwt jwt) {
        String azureAdId = jwt.getClaimAsString("oid");
        String email = extractEmail(jwt);
        String name = jwt.getClaimAsString("name");
        String preferredUsername = jwt.getClaimAsString("preferred_username");

        return userRepository.findByAzureAdId(azureAdId)
                .map(existingUser -> updateExistingUser(existingUser, email, name, jwt))
                .orElseGet(() -> createNewUser(azureAdId, email, name, preferredUsername, jwt));
    }

    private String extractEmail(Jwt jwt) {
        // Azure AD can provide email in different claims
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isEmpty()) {
            email = jwt.getClaimAsString("preferred_username");
        }
        if (email == null || email.isEmpty()) {
            email = jwt.getClaimAsString("upn");
        }
        return email;
    }

    private User updateExistingUser(User user, String email, String name, Jwt jwt) {
        boolean updated = false;

        if (email != null && !email.equals(user.getEmail())) {
            user.setEmail(email);
            updated = true;
        }
        // Note: Don't update displayName here - user may have customized it via profile page
        // Display name is only set automatically on first login (user creation)

        // Set region from Azure AD if not already set
        if (user.getRegion() == null || user.getRegion() == User.Region.OTHER) {
            User.Region detectedRegion = extractRegion(jwt);
            if (detectedRegion != User.Region.OTHER) {
                user.setRegion(detectedRegion);
                updated = true;
                log.info("Updated user region from Azure AD: {} -> {}", user.getUsername(), detectedRegion);
            }
        }

        user.setLastLogin(LocalDateTime.now());

        if (updated) {
            log.info("Updated user from Azure AD: {}", user.getUsername());
        }

        return userRepository.save(user);
    }

    private User createNewUser(String azureAdId, String email, String name, String preferredUsername, Jwt jwt) {
        String username = generateUsername(email, preferredUsername);
        User.Region region = extractRegion(jwt);

        User newUser = User.builder()
                .azureAdId(azureAdId)
                .username(username)
                .email(email)
                .displayName(name != null ? name : username)
                .authProvider(User.AuthProvider.AZURE_AD)
                .role(User.Role.USER)
                .region(region)
                .lastLogin(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("Created new user from Azure AD: {} ({}) region: {}", savedUser.getUsername(), savedUser.getEmail(), savedUser.getRegion());

        return savedUser;
    }

    private User.Region extractRegion(Jwt jwt) {
        // Try different Azure AD claims for location
        String country = jwt.getClaimAsString("ctry");  // Country code (e.g., "BG", "PL")
        if (country == null) {
            country = jwt.getClaimAsString("country");
        }

        String officeLocation = jwt.getClaimAsString("officeLocation");

        log.debug("Azure AD location claims - country: {}, officeLocation: {}", country, officeLocation);

        if (country != null) {
            country = country.toUpperCase();
            return mapCountryToRegion(country);
        }

        if (officeLocation != null) {
            officeLocation = officeLocation.toUpperCase();
            return mapOfficeToRegion(officeLocation);
        }

        return User.Region.OTHER;
    }

    private User.Region mapCountryToRegion(String country) {
        return switch (country) {
            case "BG", "EG" -> User.Region.BG_EG;
            case "CZ", "SK" -> User.Region.CZ_SK;
            case "UA" -> User.Region.UA;
            case "RS", "RO", "HR", "SI", "BA", "ME", "MK", "AL", "XK" -> User.Region.SEE; // Southeast Europe
            case "DE", "FR", "GB", "UK", "NL", "BE", "AT", "CH", "IT", "ES", "PT" -> User.Region.WE; // Western Europe
            case "AR" -> User.Region.ARG;
            case "PL" -> User.Region.PL;
            default -> User.Region.OTHER;
        };
    }

    private User.Region mapOfficeToRegion(String office) {
        // Map office location names to regions
        if (office.contains("SOFIA") || office.contains("BULGARIA") || office.contains("CAIRO") || office.contains("EGYPT")) {
            return User.Region.BG_EG;
        }
        if (office.contains("PRAGUE") || office.contains("CZECH") || office.contains("BRATISLAVA") || office.contains("SLOVAKIA")) {
            return User.Region.CZ_SK;
        }
        if (office.contains("KYIV") || office.contains("KIEV") || office.contains("UKRAINE") || office.contains("LVIV") || office.contains("KHARKIV")) {
            return User.Region.UA;
        }
        if (office.contains("BELGRADE") || office.contains("SERBIA") || office.contains("BUCHAREST") || office.contains("ROMANIA") || office.contains("ZAGREB") || office.contains("CROATIA")) {
            return User.Region.SEE;
        }
        if (office.contains("BERLIN") || office.contains("GERMANY") || office.contains("MUNICH") || office.contains("FRANKFURT") || office.contains("LONDON") || office.contains("PARIS") || office.contains("AMSTERDAM")) {
            return User.Region.WE;
        }
        if (office.contains("BUENOS") || office.contains("ARGENTINA")) {
            return User.Region.ARG;
        }
        if (office.contains("WARSAW") || office.contains("POLAND") || office.contains("KRAKOW") || office.contains("WROCLAW") || office.contains("GDANSK")) {
            return User.Region.PL;
        }
        return User.Region.OTHER;
    }

    private String generateUsername(String email, String preferredUsername) {
        // Use email prefix or preferred_username as username
        if (email != null && email.contains("@")) {
            String baseUsername = email.substring(0, email.indexOf("@"));
            return ensureUniqueUsername(baseUsername);
        }
        if (preferredUsername != null && preferredUsername.contains("@")) {
            String baseUsername = preferredUsername.substring(0, preferredUsername.indexOf("@"));
            return ensureUniqueUsername(baseUsername);
        }
        return ensureUniqueUsername("user");
    }

    private String ensureUniqueUsername(String baseUsername) {
        String username = baseUsername;
        int suffix = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + suffix++;
        }
        return username;
    }

    private Collection<GrantedAuthority> extractAuthorities(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        return authorities;
    }
}
