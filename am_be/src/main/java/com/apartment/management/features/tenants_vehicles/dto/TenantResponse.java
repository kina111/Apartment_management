package com.apartment.management.features.tenants_vehicles.dto;

import java.time.LocalDate;

import java.util.Set;

import com.apartment.management.features.contract.dto.ContractTenantResponse;

public record TenantResponse(
    Long tenantId,
    String name,
    LocalDate dateOfBirth,
    String phoneNumber,
    String permanentAddress,
    String citizenId,
    String email,
    Boolean isContractHolder,
    Set<EmergencyContactResponse> emergencyContacts,
    Set<VehicleResponse> vehicles,
    Set<ContractTenantResponse> contractTenants
) {

}
