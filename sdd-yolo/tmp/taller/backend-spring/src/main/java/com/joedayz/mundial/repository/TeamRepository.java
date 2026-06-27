package com.joedayz.mundial.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.joedayz.mundial.domain.Confederation;
import com.joedayz.mundial.domain.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByGroupLetter(String groupLetter);
    List<Team> findByConfederation(Confederation confederation);
    Optional<Team> findByCode(String code);
}
