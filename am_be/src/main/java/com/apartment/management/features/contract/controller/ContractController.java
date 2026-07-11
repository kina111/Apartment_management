package com.apartment.management.features.contract.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.management.features.contract.dto.ContractResponse;
import com.apartment.management.features.contract.dto.ContractTenantResponse;
import com.apartment.management.features.contract.service.IContractService;
import com.apartment.management.shared.enums.ContractStatus;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/contracts")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RequiredArgsConstructor
public class ContractController {
    private final IContractService contractService;

    @GetMapping
    public ResponseEntity<List<ContractResponse>> getAllContracts() {
        return ResponseEntity.ok(contractService.getAllContracts());
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<?> getContractByRoomCode(
            @PathVariable String roomCode,
            @RequestParam(value = "status", required = false) String status) {
        if (status != null) {
            return ResponseEntity
                    .ok(contractService.getContractByRoomCodeAndStatus(roomCode, status));
        }
        return ResponseEntity.ok(contractService.getContractByRoomCode(roomCode));
    }

    @GetMapping("/{contractId}/tenant")
    public ResponseEntity<ContractTenantResponse> getContractTenantByContractId(@PathVariable Long contractId) {
        return ResponseEntity.ok(contractService.getContractTenantByContractId(contractId));
    }

}
