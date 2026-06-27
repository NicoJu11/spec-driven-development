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
class BracketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // AC-07: GET /api/v1/bracket returns all phases
    @Test
    void getFullBracket_containsAllPhases() throws Exception {
        mockMvc.perform(get("/api/v1/bracket"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.R32").exists())
                .andExpect(jsonPath("$.R16").exists())
                .andExpect(jsonPath("$.QF").exists())
                .andExpect(jsonPath("$.SF").exists())
                .andExpect(jsonPath("$.FINAL").exists())
                .andExpect(jsonPath("$.THIRD_PLACE").exists());
    }

    // AC-08: FINAL match has scores ARG 3-2 BRA
    @Test
    void getFinalMatch_hasCorrectScore() throws Exception {
        mockMvc.perform(get("/api/v1/bracket/FINAL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].homeTeamCode").value("ARG"))
                .andExpect(jsonPath("$[0].awayTeamCode").value("BRA"))
                .andExpect(jsonPath("$[0].homeScore").value(3))
                .andExpect(jsonPath("$[0].awayScore").value(2))
                .andExpect(jsonPath("$[0].winnerCode").value("ARG"));
    }

    // AC-07b: R32 has 16 matches
    @Test
    void getR32_has16Matches() throws Exception {
        mockMvc.perform(get("/api/v1/bracket/R32"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(16));
    }

    // AC-07c: invalid phase returns 400
    @Test
    void getBracketByPhase_invalid_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/bracket/INVALID"))
                .andExpect(status().isBadRequest());
    }
}
