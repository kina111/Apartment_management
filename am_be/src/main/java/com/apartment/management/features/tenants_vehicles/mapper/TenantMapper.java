package com.apartment.management.features.tenants_vehicles.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import com.apartment.management.features.contract.dto.ContractTenantResponse;
import com.apartment.management.features.tenants_vehicles.dto.EmergencyContactRequest;
import com.apartment.management.features.tenants_vehicles.dto.EmergencyContactResponse;
import com.apartment.management.features.tenants_vehicles.dto.TenantRequest;
import com.apartment.management.features.tenants_vehicles.dto.TenantResponse;
import com.apartment.management.features.tenants_vehicles.dto.VehicleRequest;
import com.apartment.management.features.tenants_vehicles.dto.VehicleResponse;
import com.apartment.management.shared.entity.ContractTenant;
import com.apartment.management.shared.entity.EmergencyContact;
import com.apartment.management.shared.entity.Tenant;
import com.apartment.management.shared.entity.Vehicle;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TenantMapper {

    TenantResponse toTenantResponse(Tenant tenant);

    EmergencyContactResponse toEmergencyContactResponse(EmergencyContact emergencyContact);

    VehicleResponse toVehicleResponse(Vehicle vehicle);

    @Mapping(target = "tenantId", source = "tenant.tenantId")
    @Mapping(target = "contractId", source = "contract.contractId")
    ContractTenantResponse toContractTenantResponse(ContractTenant contractTenant);

    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "emergencyContacts", ignore = true)
    @Mapping(target = "vehicles", ignore = true)
    @Mapping(target = "contractTenants", ignore = true)
    Tenant toTenant(TenantRequest tenantRequest);

    @Mapping(target = "contactId", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    EmergencyContact toEmergencyContact(EmergencyContactRequest request);

    @Mapping(target = "vehicleId", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    Vehicle toVehicle(VehicleRequest request);
}
