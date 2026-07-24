package com.apartment.management.features.building.dto.response;

import java.util.List;

public record BuildingDetailResponse(
        Long buildingId,
        String name,
        String address,
        Integer numberOfFloor,
        List<String> imageUrls,
        BuildingBankAccountResponse bankAccount
) {
}
