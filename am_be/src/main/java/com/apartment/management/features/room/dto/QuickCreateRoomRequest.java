package com.apartment.management.features.room.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QuickCreateRoomRequest(
        @NotBlank(message = "Room name must be not blank")
        @Size(max = 100, message = "Room name must not exceed 100 characters")
        String roomName,

        @NotNull(message = "Floor number must be not null")
        @Min(value = 1, message = "Floor number must be greater than 0")
        Integer floorNumber,

        @NotNull(message = "Room type must be not null")
        Long roomTypeId
) {
}
