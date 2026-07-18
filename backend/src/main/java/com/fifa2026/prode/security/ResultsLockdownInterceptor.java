package com.fifa2026.prode.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fifa2026.prode.service.ResultsLockdownService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

/**
 * Blocks non-admins from standings-revealing endpoints while the results are
 * sealed (see {@link ResultsLockdownService}). This is the real enforcement —
 * the frontend lockdown is only cosmetic.
 */
@Component
@RequiredArgsConstructor
public class ResultsLockdownInterceptor implements HandlerInterceptor {

    private final ResultsLockdownService lockdownService;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        // Never block CORS preflight, admins, or when the results are already open.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod()) || isAdmin() || !lockdownService.isLocked()) {
            return true;
        }

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), Map.of(
                "error", "RESULTS_LOCKED",
                "message", "Standings are sealed until the results reveal.",
                "revealAt", lockdownService.getRevealAt().toString()
        ));
        return false;
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
