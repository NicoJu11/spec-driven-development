package com.joedayz.mundial.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.joedayz.mundial.domain.Sticker;
import com.joedayz.mundial.repository.StickerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StickerService {

    private final StickerRepository stickerRepository;

    public List<Sticker> getByTeamCode(String teamCode) {
        return stickerRepository.findByTeamCodeOrderByTypeAscShirtNumberAsc(teamCode.toUpperCase());
    }
}
