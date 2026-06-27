package com.joedayz.mundial.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "stickers")
@Data
@NoArgsConstructor
public class Sticker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_code", nullable = false, length = 3)
    private String teamCode;

    @Column(name = "player_name", length = 100)
    private String playerName;

    @Enumerated(EnumType.STRING)
    @Column(length = 5)
    private Position position;

    @Column(name = "shirt_number")
    private Integer shirtNumber;

    @Column(name = "image_url", nullable = false, length = 200)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private StickerType type;
}
