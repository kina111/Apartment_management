package com.apartment.management.features.accountmanagement.dto;

import java.util.List;

public record CreateManagerRequest(
        String accountName,
        String email,
        String password,
        List<Long> buildingIds
) {
}
