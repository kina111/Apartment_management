package com.apartment.management.features.tenants_vehicles.service;

import java.util.List;

import com.apartment.management.features.tenants_vehicles.dto.TenantRequest;
import com.apartment.management.features.tenants_vehicles.dto.TenantResponse;
import com.apartment.management.features.tenants_vehicles.dto.VehicleRequest;
import com.apartment.management.features.tenants_vehicles.dto.VehicleResponse;

public interface ITenantVehicleService {

    TenantResponse getTenantByContractTenantId(Long contractTenantId);

    List<TenantResponse> getTenantsByContractId(Long contractId);

    List<TenantResponse> getTenantsDoNotLeaveByContractId(Long contractId);

    List<TenantResponse> getAllTenants();

    List<VehicleResponse> getVehiclesByTenantId(Long tenantId);

    TenantResponse addTenantToContract(Long contractId, TenantRequest request);

    boolean tenantLeave(Long contractId, Long tenantId);

    TenantResponse updateTenant(Long tenantId, TenantRequest request);

    TenantResponse addVehicleToTenant(Long tenantId, VehicleRequest request);

    boolean deleteVehicleByTenantIdAndVehicleId(Long tenantId, Long vehicleId);

    List<TenantResponse> getAllTenantsDoNotLeaveByBuildingId(Long buildingId);

    List<VehicleResponse> getAllVehiclesByBuildingId(Long buildingId);
}
