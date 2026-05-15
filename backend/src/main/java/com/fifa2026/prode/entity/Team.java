package com.fifa2026.prode.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, length = 3)
    private String code;

    private String flagUrl;

    @Column(name = "group_letter", length = 1)
    private String groupLetter;

    private Integer fifaRanking;

    private String confederation;
}
