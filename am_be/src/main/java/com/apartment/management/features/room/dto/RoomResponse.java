package com.apartment.management.features.room.dto;

import com.apartment.management.shared.enums.RoomStatus;


public record RoomResponse(
                String roomCode,
                Integer floorNumber,
                RoomStatus status,
            RoomTypeResponse roomType) {

}
