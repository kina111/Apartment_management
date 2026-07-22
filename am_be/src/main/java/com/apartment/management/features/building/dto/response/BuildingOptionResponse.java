package com.apartment.management.features.building.dto.response;

public record BuildingOptionResponse(
        Long buildingId,
        String name,
        String address
) {
}
