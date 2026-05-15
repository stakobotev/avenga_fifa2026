package com.fifa2026.prode.scheduler;

import com.fifa2026.prode.service.FootballDataApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicReference;

@Component
@RequiredArgsConstructor
@Slf4j
public class MatchSyncScheduler {

    private final FootballDataApiService footballDataApiService;

    @Value("${football-data.enabled:false}")
    private boolean enabled;

    private final AtomicReference<FootballDataApiService.SyncResult> lastSyncResult = new AtomicReference<>();
    private final AtomicReference<LocalDateTime> lastSyncAttempt = new AtomicReference<>();

    /**
     * Sync match results every 5 minutes
     * Free tier allows 10 requests per minute, so this is well within limits
     */
    @Scheduled(fixedDelayString = "${football-data.sync-interval:300000}") // Default: 5 minutes
    public void syncMatchResults() {
        if (!enabled || !footballDataApiService.isEnabled()) {
            return;
        }

        log.info("Starting scheduled match sync at {}", LocalDateTime.now());
        lastSyncAttempt.set(LocalDateTime.now());

        try {
            FootballDataApiService.SyncResult result = footballDataApiService.syncMatchResults();
            lastSyncResult.set(result);

            if (result.getUpdated() > 0) {
                log.info("Match sync completed: {} matches updated", result.getUpdated());
            }
        } catch (Exception e) {
            log.error("Error during scheduled match sync", e);
            FootballDataApiService.SyncResult errorResult = new FootballDataApiService.SyncResult();
            errorResult.setMessage("Sync failed: " + e.getMessage());
            lastSyncResult.set(errorResult);
        }
    }

    /**
     * Get the last sync result for status display
     */
    public FootballDataApiService.SyncResult getLastSyncResult() {
        return lastSyncResult.get();
    }

    /**
     * Get the last sync attempt time
     */
    public LocalDateTime getLastSyncAttempt() {
        return lastSyncAttempt.get();
    }

    /**
     * Manually trigger a sync (for admin use)
     */
    public FootballDataApiService.SyncResult triggerManualSync() {
        log.info("Manual sync triggered at {}", LocalDateTime.now());
        lastSyncAttempt.set(LocalDateTime.now());

        FootballDataApiService.SyncResult result = footballDataApiService.syncMatchResults();
        lastSyncResult.set(result);

        return result;
    }
}
