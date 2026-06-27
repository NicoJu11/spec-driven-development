package com.joedayz.mundial.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.joedayz.mundial.controller.dto.MatchDto;
import com.joedayz.mundial.service.BracketService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/bracket")
@RequiredArgsConstructor
public class BracketController {

    private final BracketService bracketService;

    @GetMapping
    public ResponseEntity<Map<String, List<MatchDto>>> getFullBracket() {
        Map<String, List<MatchDto>> result = new java.util.LinkedHashMap<>();
        bracketService.getFullBracket().forEach((phase, matches) ->
                result.put(phase, matches.stream().map(MatchDto::from).toList()));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{phase}")
    public ResponseEntity<List<MatchDto>> getByPhase(@PathVariable String phase) {
        return ResponseEntity.ok(bracketService.getByPhase(phase).stream()
                .map(MatchDto::from).toList());
    }
}
