package com.apartment.management.features.tenants_vehicles.service;

import java.util.List;

import com.apartment.management.features.tenants_vehicles.dto.TenantResponse;
import com.apartment.management.features.tenants_vehicles.dto.VehicleResponse;

public interface ITenantVehicleService {

    TenantResponse getTenantByContractTenantId(Long contractTenantId);

    List<TenantResponse> getTenantsByContractId(Long contractId);

    List<TenantResponse> getAllTenants();

    List<VehicleResponse> getVehiclesByTenantId(Long tenantId);
}
