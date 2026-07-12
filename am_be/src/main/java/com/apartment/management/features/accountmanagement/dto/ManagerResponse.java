package com.apartment.management.features.accountmanagement.dto;

import java.util.List;

public record ManagerResponse(
        Long accountId,
        String accountName,
        String email,
        String status,
        List<BuildingInfo> managedBuildings
) {
    public record BuildingInfo(Long buildingId, String name) {}
}
