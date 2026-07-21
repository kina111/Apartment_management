package com.apartment.management.features.contract.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.apartment.management.features.contract.dto.*;
import com.apartment.management.features.contract.mapper.ContractMapper;
import com.apartment.management.features.contract.repository.ContractRepository;
import com.apartment.management.features.contract.repository.ContractTenantRepository;
import com.apartment.management.features.contract.specification.ContractSpecification;
import com.apartment.management.features.tenants_vehicles.dto.TenantResponse;
import com.apartment.management.features.tenants_vehicles.mapper.TenantMapper;
import com.apartment.management.features.tenants_vehicles.repository.TenantRepository;
import com.apartment.management.features.room.repository.RoomRepository;
import com.apartment.management.shared.entity.*;
import com.apartment.management.shared.enums.*;
import com.apartment.management.shared.service.CloudService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContractService implements IContractService {

    private final ContractRepository contractRepository;
    private final ContractTenantRepository contractTenantRepository;
    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;
    private final ContractMapper contractMapper;
    private final TenantMapper tenantMapper;
    private final CloudService cloudService;

    @Override
    public List<ContractResponse> getAllContracts() {
        return contractRepository.findAllWithDetails().stream().map(contractMapper::toContractResponse).toList();
    }

    @Override
    public List<ContractResponse> getContractByRoomCode(String roomCode) {
        List<Contract> contracts = contractRepository.findByRoomCode(roomCode).orElse(new ArrayList<>());
        return contracts.stream().map(contractMapper::toContractResponse).toList();
    }

    @Override
    public ContractResponse getContractByRoomCodeAndStatus(String roomCode, String status) {
        ContractStatus statusEnum = ContractStatus.valueOf(status);
        return contractRepository.findByRoomCodeAndStatus(roomCode, statusEnum).map(contractMapper::toContractResponse)
                .orElse(null);
    }

    @Override
    public ContractTenantResponse getContractTenantByContractId(Long contractId) {
        return contractTenantRepository.findByContractId(contractId).map(contractMapper::toContractTenantResponse)
                .orElse(null);
    }

    @Override
    public Page<ContractResponse> searchContracts(ContractSearchRequest request, Pageable pageable) {
        return contractRepository.findAll(ContractSpecification.filterContracts(request.getSearch(), request.getStatus()), pageable)
                .map(contractMapper::toContractResponse);
    }

    @Override
    public ContractResponse getContractById(Long contractId) {
        return contractRepository.findById(contractId)
                .map(contractMapper::toContractResponse)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + contractId));
    }

    @Override
    @Transactional
    public ContractResponse createContract(CreateContractRequest request, List<MultipartFile> images) {
        Room room = roomRepository.findById(request.getRoomCode())
                .orElseThrow(() -> new RuntimeException("Room not found: " + request.getRoomCode()));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new RuntimeException("Room is not AVAILABLE, cannot create contract");
        }

        Tenant tenant;
        if (request.getTenantId() != null) {
            tenant = tenantRepository.findById(request.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Tenant not found with id: " + request.getTenantId()));
        } else {
            tenant = Tenant.builder()
                    .name(request.getTenantName())
                    .dateOfBirth(request.getTenantDateOfBirth())
                    .phoneNumber(request.getTenantPhoneNumber())
                    .permanentAddress(request.getTenantPermanentAddress())
                    .citizenId(request.getTenantCitizenId())
                    .email(request.getTenantEmail())
                    .build();
            tenant = tenantRepository.save(tenant);
        }

        Contract contract = Contract.builder()
                .rent(request.getRent())
                .depositAmount(request.getDepositAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(ContractStatus.ACTIVE)
                .room(room)
                .contractTenants(new HashSet<>())
                .serviceFees(new HashSet<>())
                .images(new HashSet<>())
                .build();

        ContractTenant contractTenant = ContractTenant.builder()
                .contract(contract)
                .tenant(tenant)
                .isContractHolder(true)
                .joinDate(request.getStartDate())
                .build();
        contract.getContractTenants().add(contractTenant);

        if (request.getServiceFees() != null) {
            for (ServiceFeeRequest feeReq : request.getServiceFees()) {
                ServiceFee serviceFee = ServiceFee.builder()
                        .name(feeReq.getName())
                        .fee(feeReq.getFee())
                        .chargeType(feeReq.getChargeType())
                        .contract(contract)
                        .build();
                contract.getServiceFees().add(serviceFee);
            }
        }

        List<String> uploadedUrls = new ArrayList<>();
        try {
            if (images != null && !images.isEmpty()) {
                for (MultipartFile file : images) {
                    if (file != null && !file.isEmpty()) {
                        String url = cloudService.uploadImage(file, FolderName.CONTRACT);
                        uploadedUrls.add(url);
                        ContractImage contractImage = ContractImage.builder()
                                .imageUrl(url)
                                .imageType(ImageType.ORIGINAL)
                                .contract(contract)
                                .build();
                        contract.getImages().add(contractImage);
                    }
                }
            }

            room.setStatus(RoomStatus.RENTED);
            roomRepository.save(room);

            contract = contractRepository.save(contract);
        } catch (Exception e) {
            for (String url : uploadedUrls) {
                try {
                    cloudService.deleteFile(url);
                } catch (Exception ex) {
                    // ignore rollback errors
                }
            }
            throw new RuntimeException("Failed to create contract: " + e.getMessage(), e);
        }

        return contractMapper.toContractResponse(contract);
    }

    @Override
    @Transactional
    public ContractResponse renewContract(Long contractId, RenewContractRequest request, List<MultipartFile> images) {
        Contract oldContract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        if (oldContract.getStatus() != ContractStatus.ACTIVE) {
            throw new RuntimeException("Only ACTIVE contracts can be renewed");
        }

        oldContract.setStatus(ContractStatus.EXPIRED);
        contractRepository.save(oldContract);

        Room room = oldContract.getRoom();

        ContractTenant holder = oldContract.getContractTenants().stream()
                .filter(ct -> ct.getIsContractHolder() != null && ct.getIsContractHolder())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Contract holder not found for contract: " + contractId));

        Contract newContract = Contract.builder()
                .rent(request.getRent())
                .depositAmount(oldContract.getDepositAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(ContractStatus.ACTIVE)
                .room(room)
                .parentContract(oldContract)
                .contractTenants(new HashSet<>())
                .serviceFees(new HashSet<>())
                .images(new HashSet<>())
                .build();

        ContractTenant newHolder = ContractTenant.builder()
                .contract(newContract)
                .tenant(holder.getTenant())
                .isContractHolder(true)
                .joinDate(request.getStartDate())
                .build();
        newContract.getContractTenants().add(newHolder);

        for (ContractTenant ct : oldContract.getContractTenants()) {
            if ((ct.getIsContractHolder() == null || !ct.getIsContractHolder()) && ct.getLeaveDate() == null) {
                ContractTenant newOccupant = ContractTenant.builder()
                        .contract(newContract)
                        .tenant(ct.getTenant())
                        .isContractHolder(false)
                        .joinDate(request.getStartDate())
                        .build();
                newContract.getContractTenants().add(newOccupant);
            }
        }

        for (ServiceFee oldFee : oldContract.getServiceFees()) {
            ServiceFee newFee = ServiceFee.builder()
                    .name(oldFee.getName())
                    .fee(oldFee.getFee())
                    .chargeType(oldFee.getChargeType())
                    .contract(newContract)
                    .build();
            newContract.getServiceFees().add(newFee);
        }

        List<String> uploadedUrls = new ArrayList<>();
        try {
            if (images != null && !images.isEmpty()) {
                for (MultipartFile file : images) {
                    if (file != null && !file.isEmpty()) {
                        String url = cloudService.uploadImage(file, FolderName.CONTRACT);
                        uploadedUrls.add(url);
                        ContractImage contractImage = ContractImage.builder()
                                .imageUrl(url)
                                .imageType(ImageType.APPENDIX)
                                .contract(newContract)
                                .build();
                        newContract.getImages().add(contractImage);
                    }
                }
            }

            newContract = contractRepository.save(newContract);
        } catch (Exception e) {
            for (String url : uploadedUrls) {
                try {
                    cloudService.deleteFile(url);
                } catch (Exception ex) {
                    // ignore
                }
            }
            throw new RuntimeException("Failed to renew contract: " + e.getMessage(), e);
        }

        return contractMapper.toContractResponse(newContract);
    }

    @Override
    @Transactional
    public ContractResponse transferContract(Long contractId, TransferContractRequest request, List<MultipartFile> images) {
        Contract oldContract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        if (oldContract.getStatus() != ContractStatus.ACTIVE) {
            throw new RuntimeException("Only ACTIVE contracts can be transferred");
        }

        LocalDate originalEndDate = oldContract.getEndDate();

        oldContract.setStatus(ContractStatus.TERMINATED);
        oldContract.setEndDate(request.getTransferDate().minusDays(1));
        contractRepository.save(oldContract);

        for (ContractTenant ct : oldContract.getContractTenants()) {
            if (ct.getLeaveDate() == null) {
                ct.setLeaveDate(request.getTransferDate().minusDays(1));
                contractTenantRepository.save(ct);
            }
        }

        Tenant newTenant;
        if (request.getTenantId() != null) {
            newTenant = tenantRepository.findById(request.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Tenant not found: " + request.getTenantId()));
        } else {
            newTenant = Tenant.builder()
                    .name(request.getTenantName())
                    .dateOfBirth(request.getTenantDateOfBirth())
                    .phoneNumber(request.getTenantPhoneNumber())
                    .permanentAddress(request.getTenantPermanentAddress())
                    .citizenId(request.getTenantCitizenId())
                    .email(request.getTenantEmail())
                    .build();
            newTenant = tenantRepository.save(newTenant);
        }

        Room room = oldContract.getRoom();

        Contract newContract = Contract.builder()
                .rent(oldContract.getRent())
                .depositAmount(oldContract.getDepositAmount())
                .startDate(request.getTransferDate())
                .endDate(originalEndDate)
                .status(ContractStatus.ACTIVE)
                .room(room)
                .contractTenants(new HashSet<>())
                .serviceFees(new HashSet<>())
                .images(new HashSet<>())
                .build();

        ContractTenant newHolder = ContractTenant.builder()
                .contract(newContract)
                .tenant(newTenant)
                .isContractHolder(true)
                .joinDate(request.getTransferDate())
                .build();
        newContract.getContractTenants().add(newHolder);

        for (ServiceFee oldFee : oldContract.getServiceFees()) {
            ServiceFee newFee = ServiceFee.builder()
                    .name(oldFee.getName())
                    .fee(oldFee.getFee())
                    .chargeType(oldFee.getChargeType())
                    .contract(newContract)
                    .build();
            newContract.getServiceFees().add(newFee);
        }

        List<String> uploadedUrls = new ArrayList<>();
        try {
            if (images != null && !images.isEmpty()) {
                for (MultipartFile file : images) {
                    if (file != null && !file.isEmpty()) {
                        String url = cloudService.uploadImage(file, FolderName.CONTRACT);
                        uploadedUrls.add(url);
                        ContractImage contractImage = ContractImage.builder()
                                .imageUrl(url)
                                .imageType(ImageType.APPENDIX)
                                .contract(newContract)
                                .build();
                        newContract.getImages().add(contractImage);
                    }
                }
            }

            newContract = contractRepository.save(newContract);
        } catch (Exception e) {
            for (String url : uploadedUrls) {
                try {
                    cloudService.deleteFile(url);
                } catch (Exception ex) {
                    // ignore
                }
            }
            throw new RuntimeException("Failed to transfer contract: " + e.getMessage(), e);
        }

        return contractMapper.toContractResponse(newContract);
    }

    @Override
    @Transactional
    public ContractResponse terminateContract(Long contractId, TerminateContractRequest request, List<MultipartFile> images) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new RuntimeException("Only ACTIVE contracts can be terminated");
        }

        contract.setStatus(ContractStatus.TERMINATED);
        contract.setEndDate(request.getTerminationDate());

        for (ContractTenant ct : contract.getContractTenants()) {
            if (ct.getLeaveDate() == null) {
                ct.setLeaveDate(request.getTerminationDate());
                contractTenantRepository.save(ct);
            }
        }

        Room room = contract.getRoom();
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        List<String> uploadedUrls = new ArrayList<>();
        try {
            if (images != null && !images.isEmpty()) {
                for (MultipartFile file : images) {
                    if (file != null && !file.isEmpty()) {
                        String url = cloudService.uploadImage(file, FolderName.CONTRACT);
                        uploadedUrls.add(url);
                        ContractImage contractImage = ContractImage.builder()
                                .imageUrl(url)
                                .imageType(ImageType.CHECKOUT_CONDITION)
                                .contract(contract)
                                .build();
                        contract.getImages().add(contractImage);
                    }
                }
            }

            contract = contractRepository.save(contract);
        } catch (Exception e) {
            for (String url : uploadedUrls) {
                try {
                    cloudService.deleteFile(url);
                } catch (Exception ex) {
                    // ignore
                }
            }
            throw new RuntimeException("Failed to terminate contract: " + e.getMessage(), e);
        }

        return contractMapper.toContractResponse(contract);
    }

    @Override
    public List<TenantResponse> getAvailableTenants() {
        return tenantRepository.findAvailableTenants().stream()
                .map(tenantMapper::toTenantResponse)
                .toList();
    }
}
