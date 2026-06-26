package com.apartment.management.features.room.dto;

import java.util.Set;

public record RoomTypeResponse(
        Long roomTypeId,
        String name,
        Integer capacity,
        Double area,
        String description,
        Set<RoomTypeImageResponse> images) {

}
