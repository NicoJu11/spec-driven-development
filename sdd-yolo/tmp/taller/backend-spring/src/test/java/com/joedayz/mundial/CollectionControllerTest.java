package com.joedayz.mundial;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CollectionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String VALID_SESSION = UUID.randomUUID().toString();

    // AC-10: GET /api/v1/collection returns empty list for new session
    @Test
    void getCollection_newSession_returnsEmpty() throws Exception {
        mockMvc.perform(get("/api/v1/collection")
                        .header("X-Session-Id", VALID_SESSION))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0));
    }

    // AC-11: POST collects sticker, GET then shows it
    @Test
    void collectAndRetrieve() throws Exception {
        String session = UUID.randomUUID().toString();
        // Collect sticker with id=1 (first ARG sticker)
        mockMvc.perform(post("/api/v1/collection/1")
                        .header("X-Session-Id", session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/collection")
                        .header("X-Session-Id", session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.stickerIds[0]").value(1));
    }

    // AC-12: POST same sticker twice is idempotent
    @Test
    void collectSameSticker_idempotent() throws Exception {
        String session = UUID.randomUUID().toString();
        mockMvc.perform(post("/api/v1/collection/1").header("X-Session-Id", session))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/collection/1").header("X-Session-Id", session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/collection").header("X-Session-Id", session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));
    }

    // AC-13: DELETE uncollects sticker
    @Test
    void uncollectSticker() throws Exception {
        String session = UUID.randomUUID().toString();
        mockMvc.perform(post("/api/v1/collection/2").header("X-Session-Id", session))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/v1/collection/2").header("X-Session-Id", session))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/collection").header("X-Session-Id", session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0));
    }

    // AC-14: invalid UUID session returns 400
    @Test
    void collect_invalidSession_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/collection/1")
                        .header("X-Session-Id", "not-a-uuid"))
                .andExpect(status().isBadRequest());
    }

    // AC-15: non-existent sticker returns 404
    @Test
    void collect_nonExistentSticker_returns404() throws Exception {
        mockMvc.perform(post("/api/v1/collection/999999")
                        .header("X-Session-Id", UUID.randomUUID().toString()))
                .andExpect(status().isNotFound());
    }
}
