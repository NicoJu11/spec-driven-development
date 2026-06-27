package com.joedayz.mundial.service;

import com.joedayz.mundial.domain.CollectionEntry;
import com.joedayz.mundial.exception.BadRequestException;
import com.joedayz.mundial.exception.NotFoundException;
import com.joedayz.mundial.repository.CollectionEntryRepository;
import com.joedayz.mundial.repository.StickerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionEntryRepository collectionEntryRepository;
    private final StickerRepository stickerRepository;

    public List<CollectionEntry> getCollection(String sessionId) {
        validateSessionId(sessionId);
        return collectionEntryRepository.findBySessionId(sessionId);
    }

    public CollectionEntry collect(String sessionId, Long stickerId) {
        validateSessionId(sessionId);
        if (!stickerRepository.existsById(stickerId)) {
            throw new NotFoundException("Sticker not found: " + stickerId);
        }
        return collectionEntryRepository.findBySessionIdAndStickerId(sessionId, stickerId)
                .orElseGet(() -> {
                    CollectionEntry entry = new CollectionEntry();
                    entry.setSessionId(sessionId);
                    entry.setStickerId(stickerId);
                    entry.setCollectedAt(Instant.now());
                    return collectionEntryRepository.save(entry);
                });
    }

    public void uncollect(String sessionId, Long stickerId) {
        validateSessionId(sessionId);
        collectionEntryRepository.deleteBySessionIdAndStickerId(sessionId, stickerId);
    }

    private void validateSessionId(String sessionId) {
        try {
            UUID.fromString(sessionId);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid session ID: must be a valid UUID.");
        }
    }
}
