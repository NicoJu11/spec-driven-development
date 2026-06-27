package com.joedayz.mundial.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.joedayz.mundial.domain.Standing;

public interface StandingRepository extends JpaRepository<Standing, Long> {
    List<Standing> findByGroupLetterOrderByPointsDescGoalDifferenceDescGoalsForDesc(String groupLetter);
}
