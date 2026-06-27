package com.joedayz.mundial.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.joedayz.mundial.controller.dto.StandingDto;
import com.joedayz.mundial.service.GroupService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ResponseEntity<List<String>> getGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @GetMapping("/{letter}/standings")
    public ResponseEntity<List<StandingDto>> getStandings(@PathVariable String letter) {
        return ResponseEntity.ok(groupService.getStandings(letter).stream()
                .map(StandingDto::from).toList());
    }
}
