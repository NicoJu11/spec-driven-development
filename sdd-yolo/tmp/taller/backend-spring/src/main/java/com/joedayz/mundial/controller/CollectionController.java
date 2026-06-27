package com.joedayz.mundial.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.joedayz.mundial.controller.dto.CollectionResponseDto;
import com.joedayz.mundial.domain.CollectionEntry;
import com.joedayz.mundial.service.CollectionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/collection")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;

    @GetMapping
    public ResponseEntity<CollectionResponseDto> getCollection(
            @RequestHeader("X-Session-Id") String sessionId) {
        List<CollectionEntry> entries = collectionService.getCollection(sessionId);
        List<Long> ids = entries.stream().map(CollectionEntry::getStickerId).toList();
        return ResponseEntity.ok(new CollectionResponseDto(ids, ids.size()));
    }

    @PostMapping("/{stickerId}")
    public ResponseEntity<Void> collect(
            @RequestHeader("X-Session-Id") String sessionId,
            @PathVariable Long stickerId) {
        collectionService.collect(sessionId, stickerId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{stickerId}")
    public ResponseEntity<Void> uncollect(
            @RequestHeader("X-Session-Id") String sessionId,
            @PathVariable Long stickerId) {
        collectionService.uncollect(sessionId, stickerId);
        return ResponseEntity.noContent().build();
    }
}
