package com.joedayz.mundial.controller.dto;

import com.joedayz.mundial.domain.Position;
import com.joedayz.mundial.domain.Sticker;
import com.joedayz.mundial.domain.StickerType;

import lombok.Data;

@Data
public class StickerDto {
    private Long id;
    private String teamCode;
    private String playerName;
    private Position position;
    private Integer shirtNumber;
    private String imageUrl;
    private StickerType type;

    public static StickerDto from(Sticker s) {
        StickerDto dto = new StickerDto();
        dto.id = s.getId();
        dto.teamCode = s.getTeamCode();
        dto.playerName = s.getPlayerName();
        dto.position = s.getPosition();
        dto.shirtNumber = s.getShirtNumber();
        dto.imageUrl = s.getImageUrl();
        dto.type = s.getType();
        return dto;
    }
}
