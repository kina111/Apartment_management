package com.apartment.management.features.tenants_vehicles.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.management.features.tenants_vehicles.dto.TenantResponse;
import com.apartment.management.features.tenants_vehicles.dto.VehicleResponse;
import com.apartment.management.features.tenants_vehicles.service.ITenantVehicleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tenants")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class TenantVehicleController {

    private final ITenantVehicleService tenantVehicleService;

    @GetMapping
    public ResponseEntity<List<TenantResponse>> getAllTenants() {
        return ResponseEntity.ok(tenantVehicleService.getAllTenants());
    }

    @GetMapping("/contract-tenant/{contractTenantId}")
    public ResponseEntity<TenantResponse> getTenantByContractTenantId(
            @PathVariable Long contractTenantId) {
        return ResponseEntity.ok(tenantVehicleService.getTenantByContractTenantId(contractTenantId));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<TenantResponse>> getTenantsByContractId(
            @PathVariable Long contractId) {
        return ResponseEntity.ok(tenantVehicleService.getTenantsByContractId(contractId));
    }

    @GetMapping("/{tenantId}/vehicles")
    public ResponseEntity<List<VehicleResponse>> getVehiclesByTenantId(
            @PathVariable Long tenantId) {
        return ResponseEntity.ok(tenantVehicleService.getVehiclesByTenantId(tenantId));
    }
}
