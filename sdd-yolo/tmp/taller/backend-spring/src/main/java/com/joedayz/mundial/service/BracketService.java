package com.joedayz.mundial.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.joedayz.mundial.domain.Match;
import com.joedayz.mundial.domain.Phase;
import com.joedayz.mundial.exception.BadRequestException;
import com.joedayz.mundial.repository.MatchRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BracketService {

    private final MatchRepository matchRepository;

    public Map<String, List<Match>> getFullBracket() {
        return matchRepository.findAll().stream()
                .collect(Collectors.groupingBy(m -> m.getPhase().name()));
    }

    public List<Match> getByPhase(String phaseStr) {
        Phase phase;
        try {
            phase = Phase.valueOf(phaseStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid phase: " + phaseStr);
        }
        return matchRepository.findByPhase(phase);
    }
}
