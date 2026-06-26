package com.apartment.management.features.contract.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.apartment.management.features.contract.dto.ContractResponse;
import com.apartment.management.features.contract.dto.ContractTenantResponse;
import com.apartment.management.features.contract.mapper.ContractMapper;
import com.apartment.management.features.contract.repository.ContractRepository;
import com.apartment.management.features.contract.repository.ContractTenantRepository;
import com.apartment.management.shared.entity.Contract;
import com.apartment.management.shared.enums.ContractStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContractService implements IContractService {

    private final ContractRepository contractRepository;
    private final ContractTenantRepository contractTenantRepository;
    private final ContractMapper contractMapper;

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

}
