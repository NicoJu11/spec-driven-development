package com.joedayz.mundial.controller.dto;

import java.time.LocalDate;

import com.joedayz.mundial.domain.Match;
import com.joedayz.mundial.domain.Phase;

import lombok.Data;

@Data
public class MatchDto {
    private Long id;
    private Phase phase;
    private String homeTeamCode;
    private String awayTeamCode;
    private Integer homeScore;
    private Integer awayScore;
    private LocalDate matchDate;
    private String venue;
    private String winnerCode;

    public static MatchDto from(Match m) {
        MatchDto dto = new MatchDto();
        dto.id = m.getId();
        dto.phase = m.getPhase();
        dto.homeTeamCode = m.getHomeTeamCode();
        dto.awayTeamCode = m.getAwayTeamCode();
        dto.homeScore = m.getHomeScore();
        dto.awayScore = m.getAwayScore();
        dto.matchDate = m.getMatchDate();
        dto.venue = m.getVenue();
        dto.winnerCode = m.getWinnerCode();
        return dto;
    }
}
