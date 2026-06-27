package com.joedayz.mundial.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.joedayz.mundial.controller.dto.StickerDto;
import com.joedayz.mundial.controller.dto.TeamDto;
import com.joedayz.mundial.domain.Confederation;
import com.joedayz.mundial.exception.BadRequestException;
import com.joedayz.mundial.service.StickerService;
import com.joedayz.mundial.service.TeamService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;
    private final StickerService stickerService;

    @GetMapping
    public ResponseEntity<List<TeamDto>> getTeams(
            @RequestParam(required = false) String group,
            @RequestParam(required = false) String confederation) {

        if (group != null && confederation != null) {
            throw new BadRequestException("Parameters 'group' and 'confederation' are mutually exclusive.");
        }

        if (group != null) {
            return ResponseEntity.ok(teamService.getByGroup(group).stream()
                    .map(TeamDto::from).toList());
        }

        if (confederation != null) {
            Confederation conf;
            try {
                conf = Confederation.valueOf(confederation.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid confederation: " + confederation);
            }
            return ResponseEntity.ok(teamService.getByConfederation(conf).stream()
                    .map(TeamDto::from).toList());
        }

        return ResponseEntity.ok(teamService.getAll().stream()
                .map(TeamDto::from).toList());
    }

    @GetMapping("/{code}")
    public ResponseEntity<TeamDto> getTeam(@PathVariable String code) {
        return ResponseEntity.ok(TeamDto.from(teamService.getByCode(code)));
    }

    @GetMapping("/{code}/stickers")
    public ResponseEntity<List<StickerDto>> getTeamStickers(@PathVariable String code) {
        // Ensure team exists first
        teamService.getByCode(code);
        return ResponseEntity.ok(stickerService.getByTeamCode(code).stream()
                .map(StickerDto::from).toList());
    }
}
