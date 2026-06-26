package com.apartment.management.features.contract.service;

import java.util.List;

import com.apartment.management.features.contract.dto.ContractResponse;
import com.apartment.management.features.contract.dto.ContractTenantResponse;
import com.apartment.management.shared.enums.ContractStatus;

public interface IContractService {
    List<ContractResponse> getAllContracts();
    List<ContractResponse> getContractByRoomCode(String roomCode);
    ContractResponse getContractByRoomCodeAndStatus(String roomCode, String status);
    ContractTenantResponse getContractTenantByContractId(Long contractId);
}
