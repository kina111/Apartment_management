package com.apartment.management.features.tenants_vehicles.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import com.apartment.management.features.tenants_vehicles.dto.EmergencyContactResponse;
import com.apartment.management.features.tenants_vehicles.dto.TenantResponse;
import com.apartment.management.features.tenants_vehicles.dto.VehicleResponse;
import com.apartment.management.shared.entity.EmergencyContact;
import com.apartment.management.shared.entity.Tenant;
import com.apartment.management.shared.entity.Vehicle;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TenantMapper {

    TenantResponse toTenantResponse(Tenant tenant);

    EmergencyContactResponse toEmergencyContactResponse(EmergencyContact emergencyContact);

    VehicleResponse toVehicleResponse(Vehicle vehicle);
}
