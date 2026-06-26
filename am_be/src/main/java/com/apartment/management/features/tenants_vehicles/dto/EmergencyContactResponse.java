package com.apartment.management.features.tenants_vehicles.dto;

public record EmergencyContactResponse(
        Long contactId,
        String name,
        String phoneNumber) {
}
