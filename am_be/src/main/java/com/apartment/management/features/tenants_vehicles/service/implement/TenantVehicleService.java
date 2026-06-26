package com.apartment.management.features.tenants_vehicles.service.implement;

import java.util.List;

import org.springframework.stereotype.Service;

import com.apartment.management.features.tenants_vehicles.dto.TenantResponse;
import com.apartment.management.features.tenants_vehicles.dto.VehicleResponse;
import com.apartment.management.features.tenants_vehicles.mapper.TenantMapper;
import com.apartment.management.features.tenants_vehicles.repository.TenantRepository;
import com.apartment.management.features.tenants_vehicles.repository.VehicleRepository;
import com.apartment.management.features.tenants_vehicles.service.ITenantVehicleService;
import com.apartment.management.shared.entity.ContractTenant;
import com.apartment.management.shared.entity.Tenant;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TenantVehicleService implements ITenantVehicleService {

    private final TenantRepository tenantRepository;
    private final VehicleRepository vehicleRepository;
    private final TenantMapper tenantMapper;

    @Override
    public TenantResponse getTenantByContractTenantId(Long contractTenantId) {
        Tenant tenant = tenantRepository.findByContractTenantId(contractTenantId);
        if (tenant == null) {
            return null;
        }
        return tenantMapper.toTenantResponse(tenant);
    }

    @Override
    public List<TenantResponse> getTenantsByContractId(Long contractId) {
        return tenantRepository.findByContractId(contractId).stream()
                .map(t -> {
                    TenantResponse tenantResponse = tenantMapper.toTenantResponse(t);
                    Boolean isHolder = tenantRepository.isContractHolder(t.getTenantId(), contractId);
                    return new TenantResponse(
                            tenantResponse.tenantId(),
                            tenantResponse.name(),
                            tenantResponse.dateOfBirth(),
                            tenantResponse.phoneNumber(),
                            tenantResponse.permanentAddress(),
                            tenantResponse.citizenId(),
                            tenantResponse.email(),
                            isHolder,
                            tenantResponse.emergencyContacts(),
                            tenantResponse.vehicles(),
                            tenantResponse.contractTenants());
                })
                .toList();
    }

    @Override
    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAllWithDetails().stream()
                .map(tenantMapper::toTenantResponse)
                .toList();
    }

    @Override
    public List<VehicleResponse> getVehiclesByTenantId(Long tenantId) {
        return vehicleRepository.findByTenantTenantId(tenantId).stream()
                .map(tenantMapper::toVehicleResponse)
                .toList();
    }
}
