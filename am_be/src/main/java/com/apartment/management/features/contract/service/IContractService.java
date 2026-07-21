package com.apartment.management.features.contract.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.apartment.management.features.contract.dto.*;
import com.apartment.management.features.tenants_vehicles.dto.TenantResponse;

public interface IContractService {
    List<ContractResponse> getAllContracts();
    List<ContractResponse> getContractByRoomCode(String roomCode);
    ContractResponse getContractByRoomCodeAndStatus(String roomCode, String status);
    ContractTenantResponse getContractTenantByContractId(Long contractId);
    
    // New operations
    Page<ContractResponse> searchContracts(ContractSearchRequest request, Pageable pageable);
    ContractResponse getContractById(Long contractId);
    ContractResponse createContract(CreateContractRequest request, List<MultipartFile> images);
    ContractResponse renewContract(Long contractId, RenewContractRequest request, List<MultipartFile> images);
    ContractResponse transferContract(Long contractId, TransferContractRequest request, List<MultipartFile> images);
    ContractResponse terminateContract(Long contractId, TerminateContractRequest request, List<MultipartFile> images);
    List<TenantResponse> getAvailableTenants();
}
