package com.joedayz.mundial;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TeamControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // AC-01: GET /api/v1/teams returns 48 teams
    @Test
    void getAllTeams_returns48() throws Exception {
        mockMvc.perform(get("/api/v1/teams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(48));
    }

    // AC-03: GET /api/v1/teams?group=A returns 4 teams
    @Test
    void getTeamsByGroup_A_returns4() throws Exception {
        mockMvc.perform(get("/api/v1/teams").param("group", "A"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4));
    }

    // AC-19: GET /api/v1/teams?confederation=UEFA returns 16 teams
    @Test
    void getTeamsByConfederation_UEFA_returns16() throws Exception {
        mockMvc.perform(get("/api/v1/teams").param("confederation", "UEFA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(16));
    }

    // AC-20: group + confederation combined returns 400
    @Test
    void getTeams_groupAndConfederation_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/teams")
                        .param("group", "A")
                        .param("confederation", "UEFA"))
                .andExpect(status().isBadRequest());
    }

    // AC-21: invalid confederation returns 400
    @Test
    void getTeamsByConfederation_invalid_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/teams").param("confederation", "INVALID"))
                .andExpect(status().isBadRequest());
    }

    // AC-02: GET /api/v1/teams/ARG/stickers returns 23 stickers (includes SEDE)
    @Test
    void getArgentinaStickers_returns23() throws Exception {
        mockMvc.perform(get("/api/v1/teams/ARG/stickers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(23));
    }

    // AC-22: GET /api/v1/teams/USA/stickers returns 24 stickers (23 PLAYER + 1 SEDE)
    @Test
    void getUsaStickers_returns24() throws Exception {
        mockMvc.perform(get("/api/v1/teams/USA/stickers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(24));
    }

    // AC-23: Messi is sticker #10 for ARG
    @Test
    void getArgentinaStickers_containsMessi() throws Exception {
        mockMvc.perform(get("/api/v1/teams/ARG/stickers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.shirtNumber == 10 && @.playerName == 'Lionel Messi')]").exists());
    }

    // AC-24: SEDE sticker for USA has type SEDE
    @Test
    void getUsaStickers_containsSedeSticker() throws Exception {
        mockMvc.perform(get("/api/v1/teams/USA/stickers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.type == 'SEDE')]").exists());
    }

    // AC-09: unknown team code returns 404
    @Test
    void getTeam_unknownCode_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/teams/XYZ"))
                .andExpect(status().isNotFound());
    }
}
