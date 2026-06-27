package com.joedayz.mundial.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.joedayz.mundial.domain.Standing;
import com.joedayz.mundial.exception.BadRequestException;
import com.joedayz.mundial.repository.StandingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupService {

    private static final String VALID_GROUPS = "ABCDEFGHIJKL";

    private final StandingRepository standingRepository;

    public List<String> getAllGroups() {
        return VALID_GROUPS.chars()
                .mapToObj(c -> String.valueOf((char) c))
                .toList();
    }

    public List<Standing> getStandings(String letter) {
        if (letter == null || letter.length() != 1 || !VALID_GROUPS.contains(letter.toUpperCase())) {
            throw new BadRequestException("Invalid group letter: " + letter + ". Must be A-L.");
        }
        return standingRepository
                .findByGroupLetterOrderByPointsDescGoalDifferenceDescGoalsForDesc(letter.toUpperCase());
    }
}
