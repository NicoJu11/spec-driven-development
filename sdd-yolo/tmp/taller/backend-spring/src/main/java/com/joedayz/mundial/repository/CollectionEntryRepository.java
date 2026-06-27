package com.joedayz.mundial.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.joedayz.mundial.domain.CollectionEntry;

public interface CollectionEntryRepository extends JpaRepository<CollectionEntry, Long> {
    Optional<CollectionEntry> findBySessionIdAndStickerId(String sessionId, Long stickerId);
    List<CollectionEntry> findBySessionId(String sessionId);

    @Modifying
    @Transactional
    void deleteBySessionIdAndStickerId(String sessionId, Long stickerId);
}
