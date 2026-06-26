package com.apartment.management.features.tenants_vehicles.dto;

public record VehicleResponse(
        Long vehicleId,
        String numberPlate,
        String vehicleType) {
}
