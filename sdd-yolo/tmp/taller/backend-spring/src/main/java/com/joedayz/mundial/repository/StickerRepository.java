package com.joedayz.mundial.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.joedayz.mundial.domain.Sticker;

public interface StickerRepository extends JpaRepository<Sticker, Long> {
    List<Sticker> findByTeamCode(String teamCode);
    List<Sticker> findByTeamCodeOrderByTypeAscShirtNumberAsc(String teamCode);
}
