package com.apartment.management.features.tenants_vehicles.dto;

import java.time.LocalDate;
import java.util.Set;

public record TenantRequest(
    String name,
    LocalDate dateOfBirth,
    String phoneNumber,
    String permanentAddress,
    String citizenId,
    String email,
    Set<EmergencyContactRequest> emergencyContacts
) {
}
