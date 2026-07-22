package com.apartment.management.features.room.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateRoomTypeRequest(
        @NotBlank(message = "Room type name must be not blank")
        @Size(max = 255, message = "Room type name must not exceed 255 characters")
        String name,

        @NotNull(message = "Capacity must be not null")
        @Min(value = 1, message = "Capacity must be greater than 0")
        Integer capacity,

        @NotNull(message = "Area must be not null")
        @Positive(message = "Area must be greater than 0")
        Double area,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description
) {
}
