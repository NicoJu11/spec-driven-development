package com.joedayz.mundial.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.joedayz.mundial.domain.Confederation;
import com.joedayz.mundial.domain.Team;
import com.joedayz.mundial.exception.BadRequestException;
import com.joedayz.mundial.exception.NotFoundException;
import com.joedayz.mundial.repository.TeamRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamService {

    private static final String VALID_GROUPS = "ABCDEFGHIJKL";

    private final TeamRepository teamRepository;

    public List<Team> getAll() {
        return teamRepository.findAll();
    }

    public List<Team> getByGroup(String letter) {
        if (letter == null || letter.length() != 1 || !VALID_GROUPS.contains(letter.toUpperCase())) {
            throw new BadRequestException("Invalid group letter: " + letter + ". Must be A-L.");
        }
        return teamRepository.findByGroupLetter(letter.toUpperCase());
    }

    public List<Team> getByConfederation(Confederation confederation) {
        return teamRepository.findByConfederation(confederation);
    }

    public Team getByCode(String code) {
        return teamRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new NotFoundException("Team not found: " + code));
    }
}
