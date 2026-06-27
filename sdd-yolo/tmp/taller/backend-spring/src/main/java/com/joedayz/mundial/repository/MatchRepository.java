package com.joedayz.mundial.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.joedayz.mundial.domain.Match;
import com.joedayz.mundial.domain.Phase;

public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByPhase(Phase phase);
}
