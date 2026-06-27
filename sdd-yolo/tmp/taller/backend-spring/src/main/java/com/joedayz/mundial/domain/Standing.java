package com.joedayz.mundial.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "standings")
@Data
@NoArgsConstructor
public class Standing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_letter", nullable = false, length = 1)
    private String groupLetter;

    @Column(name = "team_code", nullable = false, length = 3)
    private String teamCode;

    @Column(nullable = false)
    private int played;

    @Column(nullable = false)
    private int won;

    @Column(nullable = false)
    private int drawn;

    @Column(nullable = false)
    private int lost;

    @Column(name = "goals_for", nullable = false)
    private int goalsFor;

    @Column(name = "goals_against", nullable = false)
    private int goalsAgainst;

    @Column(name = "goal_difference", nullable = false)
    private int goalDifference;

    @Column(nullable = false)
    private int points;
}
