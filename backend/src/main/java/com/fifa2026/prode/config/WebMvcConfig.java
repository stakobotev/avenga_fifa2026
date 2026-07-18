package com.fifa2026.prode.config;

import com.fifa2026.prode.security.ResultsLockdownInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Wires the results-lockdown interceptor onto the endpoints that expose standings.
 * The teaser/envelope endpoints under /api/reveal/** are intentionally NOT covered,
 * so the countdown screen keeps working while everything else is sealed.
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final ResultsLockdownInterceptor resultsLockdownInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(resultsLockdownInterceptor)
                .addPathPatterns(
                        "/api/leaderboard/**",
                        "/api/statistics/**",
                        "/api/leagues/**"
                );
    }
}
