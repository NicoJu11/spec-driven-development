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
class GroupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // AC-05: GET /api/v1/groups returns 12 groups
    @Test
    void getAllGroups_returns12() throws Exception {
        mockMvc.perform(get("/api/v1/groups"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(12));
    }

    // AC-04: Group A standings ordered GER(9) > USA(6) > MAR(3) > JPN(0)
    @Test
    void getGroupAStandings_orderedByPoints() throws Exception {
        mockMvc.perform(get("/api/v1/groups/A/standings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].teamCode").value("GER"))
                .andExpect(jsonPath("$[0].points").value(9))
                .andExpect(jsonPath("$[1].teamCode").value("USA"))
                .andExpect(jsonPath("$[1].points").value(6))
                .andExpect(jsonPath("$[2].teamCode").value("MAR"))
                .andExpect(jsonPath("$[2].points").value(3))
                .andExpect(jsonPath("$[3].teamCode").value("JPN"))
                .andExpect(jsonPath("$[3].points").value(0));
    }

    // AC-06: Invalid group letter returns 400
    @Test
    void getGroupStandings_invalidLetter_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/groups/Z/standings"))
                .andExpect(status().isBadRequest());
    }
}
