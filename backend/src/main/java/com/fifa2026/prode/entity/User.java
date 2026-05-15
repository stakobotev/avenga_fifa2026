package com.fifa2026.prode.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = true)
    private String password;

    @Column(unique = true)
    private String azureAdId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider authProvider;

    private String displayName;

    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Region region = Region.OTHER;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime lastLogin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @ManyToMany(mappedBy = "members")
    private Set<League> leagues = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (role == null) {
            role = Role.USER;
        }
        if (authProvider == null) {
            authProvider = AuthProvider.LOCAL;
        }
        if (region == null) {
            region = Region.OTHER;
        }
    }

    public enum Role {
        USER, ADMIN
    }

    public enum AuthProvider {
        LOCAL, AZURE_AD
    }

    public enum Region {
        BG_EG("BG & EG"),
        CZ_SK("CZ & SK"),
        UA("UA"),
        SEE("SEE"),
        WE("WE"),
        ARG("ARG"),
        PL("PL"),
        OTHER("Other");

        private final String displayName;

        Region(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
