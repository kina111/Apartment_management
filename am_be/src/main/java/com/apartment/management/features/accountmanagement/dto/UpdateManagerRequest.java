package com.apartment.management.features.accountmanagement.dto;

import java.util.List;

public record UpdateManagerRequest(
        String accountName,
        String email,
        String password,
        String status,
        List<Long> buildingIds
) {
}
