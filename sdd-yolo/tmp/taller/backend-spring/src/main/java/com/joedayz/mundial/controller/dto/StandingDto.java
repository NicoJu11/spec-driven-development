package com.joedayz.mundial.controller.dto;

import com.joedayz.mundial.domain.Standing;

import lombok.Data;

@Data
public class StandingDto {
    private String teamCode;
    private int played;
    private int won;
    private int drawn;
    private int lost;
    private int goalsFor;
    private int goalsAgainst;
    private int goalDifference;
    private int points;

    public static StandingDto from(Standing s) {
        StandingDto dto = new StandingDto();
        dto.teamCode = s.getTeamCode();
        dto.played = s.getPlayed();
        dto.won = s.getWon();
        dto.drawn = s.getDrawn();
        dto.lost = s.getLost();
        dto.goalsFor = s.getGoalsFor();
        dto.goalsAgainst = s.getGoalsAgainst();
        dto.goalDifference = s.getGoalDifference();
        dto.points = s.getPoints();
        return dto;
    }
}
