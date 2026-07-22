package com.apartment.management.features.contract.controller;

import com.apartment.management.features.contract.dto.*;
import com.apartment.management.features.contract.service.IContractService;
import com.apartment.management.features.tenants_vehicles.dto.TenantResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ContractController {

    private final IContractService contractService;

    @GetMapping
    public ResponseEntity<Page<ContractResponse>> searchContracts(
            @ModelAttribute ContractSearchRequest request,
            Pageable pageable) {
        return ResponseEntity.ok(contractService.searchContracts(request, pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ContractResponse>> getAllContracts() {
        return ResponseEntity.ok(contractService.getAllContracts());
    }

    @GetMapping("/id/{contractId}")
    public ResponseEntity<ContractResponse> getContractById(@PathVariable("contractId") Long contractId) {
        return ResponseEntity.ok(contractService.getContractById(contractId));
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<List<ContractResponse>> getContractsByRoomId(@PathVariable("roomCode") String roomCode) {
        return ResponseEntity.ok(contractService.getContractByRoomCode(roomCode));
    }

    @GetMapping("/active/{roomCode}")
    public ResponseEntity<ContractResponse> getActiveContractByRoomCode(@PathVariable("roomCode") String roomCode) {
        return ResponseEntity.ok(contractService.getContractByRoomCodeAndStatus(roomCode, "ACTIVE"));
    }

    @GetMapping("/{contractId}/tenant")
    public ResponseEntity<ContractTenantResponse> getContractTenantByContractId(
            @PathVariable("contractId") Long contractId) {
        return ResponseEntity.ok(contractService.getContractTenantByContractId(contractId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'LANDLORD', 'MANAGER')")
    public ResponseEntity<ContractResponse> createContract(
            @ModelAttribute CreateContractRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contractService.createContract(request, images));
    }

    @PostMapping(value = "/{contractId}/renew", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'LANDLORD', 'MANAGER')")
    public ResponseEntity<ContractResponse> renewContract(
            @PathVariable("contractId") Long contractId,
            @ModelAttribute RenewContractRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        return ResponseEntity.ok(contractService.renewContract(contractId, request, images));
    }

    @PostMapping(value = "/{contractId}/transfer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'LANDLORD', 'MANAGER')")
    public ResponseEntity<ContractResponse> transferContract(
            @PathVariable("contractId") Long contractId,
            @ModelAttribute TransferContractRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        return ResponseEntity.ok(contractService.transferContract(contractId, request, images));
    }

    @PostMapping(value = "/{contractId}/terminate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'LANDLORD', 'MANAGER')")
    public ResponseEntity<ContractResponse> terminateContract(
            @PathVariable("contractId") Long contractId,
            @ModelAttribute TerminateContractRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        return ResponseEntity.ok(contractService.terminateContract(contractId, request, images));
    }

    @GetMapping("/tenants/available")
    public ResponseEntity<List<TenantResponse>> getAvailableTenants() {
        return ResponseEntity.ok(contractService.getAvailableTenants());
    }
}
