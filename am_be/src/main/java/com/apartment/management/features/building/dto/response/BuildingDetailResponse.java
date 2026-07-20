package com.apartment.management.features.building.dto.response;

import java.util.List;

public record BuildingDetailResponse(
        Long buildingId,
        String name,
        String address,
        Integer numberOfFloor,
        String description,
        Double area,
        Integer numberOfBasement,
        Integer totalRooms,
        Integer yearBuilt,
        String phoneNumber,
        String email,
        List<String> imageUrls
) {
}
