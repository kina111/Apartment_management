package com.apartment.management.features.tenants_vehicles.service.implement;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apartment.management.features.contract.repository.ContractRepository;
import com.apartment.management.features.contract.repository.ContractTenantRepository;
import com.apartment.management.features.tenants_vehicles.dto.TenantRequest;
import com.apartment.management.features.tenants_vehicles.dto.TenantResponse;
import com.apartment.management.features.tenants_vehicles.dto.VehicleRequest;
import com.apartment.management.features.tenants_vehicles.dto.VehicleResponse;
import com.apartment.management.features.tenants_vehicles.mapper.TenantMapper;
import com.apartment.management.features.tenants_vehicles.repository.TenantRepository;
import com.apartment.management.features.tenants_vehicles.repository.VehicleRepository;
import com.apartment.management.features.tenants_vehicles.service.ITenantVehicleService;
import com.apartment.management.shared.entity.Contract;
import com.apartment.management.shared.entity.ContractTenant;
import com.apartment.management.shared.entity.EmergencyContact;
import com.apartment.management.shared.entity.Tenant;
import com.apartment.management.shared.entity.Vehicle;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TenantVehicleService implements ITenantVehicleService {

    private final TenantRepository tenantRepository;
    private final VehicleRepository vehicleRepository;
    private final TenantMapper tenantMapper;
    private final ContractRepository contractRepository;
    private final ContractTenantRepository contractTenantRepository;

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
    public List<TenantResponse> getTenantsDoNotLeaveByContractId(Long contractId) {
        return tenantRepository.findTenantsDoNotLeaveByContractId(contractId).stream()
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

    @Override
    @Transactional
    public TenantResponse addTenantToContract(Long contractId, TenantRequest request) {
        // 1. Tìm contract trước
        Contract currentContract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found: " + contractId));

        // 2. Tạo Tenant mới (chưa có ID — transient)
        Tenant newTenant = tenantMapper.toTenant(request);
        newTenant.setContractTenants(new HashSet<>());

        // 3. Map emergencyContacts từ request (nếu có), gán tenant 2 chiều
        Set<EmergencyContact> newContacts = request.emergencyContacts().stream()
                .map(dto -> {
                    EmergencyContact contact = tenantMapper.toEmergencyContact(dto);
                    contact.setTenant(newTenant);
                    return contact;
                }).collect(Collectors.toSet());
        newTenant.setEmergencyContacts(newContacts);

        // 4. Build ContractTenant, gán cả 2 chiều của quan hệ
        ContractTenant newContractTenant = ContractTenant.builder()
                .tenant(newTenant) // tenant sẽ được cascade persist
                .contract(currentContract)
                .isContractHolder(false)
                .joinDate(LocalDate.now())
                .leaveDate(null)
                .build();

        // 5. Thêm vào collection của tenant (để cascade CascadeType.ALL hoạt động)
        newTenant.getContractTenants().add(newContractTenant);

        // 6. Save tenant một lần — cascade sẽ tự động persist ContractTenant +
        // EmergencyContacts
        Tenant savedTenant = tenantRepository.save(newTenant);
        return tenantMapper.toTenantResponse(savedTenant);
    }

    @Override
    @Transactional
    public boolean tenantLeave(Long contractId, Long tenantId) {
        ContractTenant current = contractTenantRepository.findByContractIdAndTenantId(contractId, tenantId)
                .orElseThrow(() -> new RuntimeException("Can't find contract tenant"));
        if (current.getIsContractHolder()) {
            throw new RuntimeException("Can't remove contract holder. Please transfer/end the contract first!");
        }
        current.setLeaveDate(LocalDate.now());
        contractTenantRepository.save(current);
        return true;
    }

    @Override
    @Transactional
    public TenantResponse updateTenant(Long tenantId, TenantRequest request) {
        Tenant existingTenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        // Update tenant fields
        if (request.name() != null) {
            existingTenant.setName(request.name());
        }
        if (request.dateOfBirth() != null) {
            existingTenant.setDateOfBirth(request.dateOfBirth());
        }
        if (request.phoneNumber() != null) {
            existingTenant.setPhoneNumber(request.phoneNumber());
        }
        if (request.permanentAddress() != null) {
            existingTenant.setPermanentAddress(request.permanentAddress());
        }
        if (request.citizenId() != null) {
            existingTenant.setCitizenId(request.citizenId());
        }
        if (request.email() != null) {
            existingTenant.setEmail(request.email());
        }

        // Update emergency contacts
        Set<EmergencyContact> newContacts = request.emergencyContacts().stream()
                .map(dto -> {
                    EmergencyContact contact = tenantMapper.toEmergencyContact(dto);
                    contact.setTenant(existingTenant);
                    return contact;
                }).collect(Collectors.toSet());
        existingTenant.getEmergencyContacts().clear();
        existingTenant.getEmergencyContacts().addAll(newContacts);

        Tenant savedTenant = tenantRepository.save(existingTenant);
        return tenantMapper.toTenantResponse(savedTenant);
    }

    @Override
    public TenantResponse addVehicleToTenant(Long tenantId, VehicleRequest request) {
        Tenant currentTenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        Vehicle newVehicle = tenantMapper.toVehicle(request);
        newVehicle.setTenant(currentTenant);

        currentTenant.getVehicles().add(newVehicle);
        tenantRepository.save(currentTenant);
        return tenantMapper.toTenantResponse(currentTenant);
    }

    @Override
    @Transactional
    public boolean deleteVehicleByTenantIdAndVehicleId(Long tenantId, Long vehicleId) {
        Tenant currTenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        currTenant.getVehicles().removeIf(v -> v.getVehicleId().equals(vehicleId));
        tenantRepository.save(currTenant);
        return true;
    }

    @Override
    public List<TenantResponse> getAllTenantsDoNotLeaveByBuildingId(Long buildingId) {
        return tenantRepository.findTenantsWithHolderStatusByBuildingId(buildingId).stream()
                .map(row -> {
                    Tenant t = (Tenant) row[0];
                    Boolean isHolder = (Boolean) row[1];
                    TenantResponse base = tenantMapper.toTenantResponse(t);
                    return new TenantResponse(
                            base.tenantId(),
                            base.name(),
                            base.dateOfBirth(),
                            base.phoneNumber(),
                            base.permanentAddress(),
                            base.citizenId(),
                            base.email(),
                            isHolder, // lấy trực tiếp từ JOIN, không query thêm
                            base.emergencyContacts(),
                            base.vehicles(),
                            base.contractTenants());
                })
                .toList();
    }

    @Override
    public List<VehicleResponse> getAllVehiclesByBuildingId(Long buildingId) {
        List<TenantResponse> allTenants = getAllTenantsDoNotLeaveByBuildingId(buildingId);
        return allTenants.stream()
                .flatMap(tenantResponse -> tenantResponse.vehicles().stream())
                .toList();
    }
}
