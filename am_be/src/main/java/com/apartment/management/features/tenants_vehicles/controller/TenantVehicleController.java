package com.apartment.management.features.tenants_vehicles.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.management.features.tenants_vehicles.dto.TenantRequest;
import com.apartment.management.features.tenants_vehicles.dto.TenantResponse;
import com.apartment.management.features.tenants_vehicles.dto.VehicleRequest;
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
        return ResponseEntity.ok(tenantVehicleService.getTenantsDoNotLeaveByContractId(contractId));
    }

    @GetMapping("/{tenantId}/vehicles")
    public ResponseEntity<List<VehicleResponse>> getVehiclesByTenantId(
            @PathVariable Long tenantId) {
        return ResponseEntity.ok(tenantVehicleService.getVehiclesByTenantId(tenantId));
    }

    @PostMapping("/contract/{contractId}/add-tenant")
    public ResponseEntity<TenantResponse> addTenantToContract(
            @PathVariable Long contractId,
            @RequestBody TenantRequest tenantRequest) {
        return ResponseEntity.ok(tenantVehicleService.addTenantToContract(contractId, tenantRequest));
    }

    @PutMapping("/contract/{contractId}/tenant/{tenantId}/leave")
    public ResponseEntity<Boolean> tenantLeave(
            @PathVariable Long contractId,
            @PathVariable Long tenantId) {
        return ResponseEntity.ok(tenantVehicleService.tenantLeave(contractId, tenantId));
    }

    @PutMapping("/{tenantId}")
    public ResponseEntity<TenantResponse> updateTenant(
            @PathVariable Long tenantId,
            @RequestBody TenantRequest tenantRequest) {
        return ResponseEntity.ok(tenantVehicleService.updateTenant(tenantId, tenantRequest));
    }

    @PostMapping("/{tenantId}/vehicles")
    public ResponseEntity<TenantResponse> addVehicleToTenant(
            @PathVariable Long tenantId,
            @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(tenantVehicleService.addVehicleToTenant(tenantId, request));
    }

    @DeleteMapping("/{tenantId}/vehicles/{vehicleId}")
    public ResponseEntity<?> deleteVehicleFromTenant(
            @PathVariable Long tenantId,
            @PathVariable Long vehicleId) {
        return ResponseEntity.ok(tenantVehicleService.deleteVehicleByTenantIdAndVehicleId(tenantId, vehicleId));
    }

    @GetMapping("/buildings/{buildingId}")
    public ResponseEntity<List<TenantResponse>> getAllTenantsDoNotLeaveByBuildingId(
            @PathVariable Long buildingId) {
        return ResponseEntity.ok(tenantVehicleService.getAllTenantsDoNotLeaveByBuildingId(buildingId));
    }

    @GetMapping("/buildings/{buildingId}/vehicles")
    public ResponseEntity<List<VehicleResponse>> getAllVehiclesDoNotLeaveByBuildingId(
            @PathVariable Long buildingId) {
        return ResponseEntity.ok(tenantVehicleService.getAllVehiclesByBuildingId(buildingId));
    }
}
