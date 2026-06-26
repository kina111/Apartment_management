package com.apartment.management.features.tenants_vehicles.dto;

import java.time.LocalDate;
import java.util.Set;

public record TenantRequest(
    Long tenantId,
    String name,
    LocalDate dateOfBirth,
    String phoneNumber,
    String permanentAddress,
    String citizenId,
    String email,
    Boolean isContractHolder,
    Set<EmergencyContactRequest> emergencyContacts
) {
}
