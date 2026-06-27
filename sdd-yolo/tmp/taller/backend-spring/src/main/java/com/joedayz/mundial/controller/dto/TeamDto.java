package com.joedayz.mundial.controller.dto;

import com.joedayz.mundial.domain.Confederation;
import com.joedayz.mundial.domain.Team;

import lombok.Data;

@Data
public class TeamDto {
    private Long id;
    private String code;
    private String name;
    private String groupLetter;
    private Confederation confederation;
    private String flagPath;

    public static TeamDto from(Team t) {
        TeamDto dto = new TeamDto();
        dto.id = t.getId();
        dto.code = t.getCode();
        dto.name = t.getName();
        dto.groupLetter = t.getGroupLetter();
        dto.confederation = t.getConfederation();
        dto.flagPath = t.getFlagPath();
        return dto;
    }
}
