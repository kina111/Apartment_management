package com.apartment.management.features.building.dto.response;

public record BuildingBankAccountResponse(
        Long bankAccountId,
        String bankName,
        String accountNumber,
        String userName
) {
}
