package com.joedayz.mundial.controller.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CollectionResponseDto {
    private List<Long> stickerIds;
    private int total;
}
