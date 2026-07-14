package com.apartment.management.features.accountmanagement.controller;

import com.apartment.management.features.accountmanagement.dto.CreateManagerRequest;
import com.apartment.management.features.accountmanagement.dto.ManagerResponse;
import com.apartment.management.features.accountmanagement.dto.UpdateManagerRequest;
import com.apartment.management.features.accountmanagement.service.AccountManagementService;
import com.apartment.management.features.auth.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/account-management")
@Tag(name = "Account Management", description = "Manage staff/manager accounts")
@PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
public class AccountManagementController {

    private final AccountManagementService service;

    public AccountManagementController(AccountManagementService service) {
        this.service = service;
    }

    @PostMapping("/landlords")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new landlord account (Admin only)")
    public ResponseEntity<ManagerResponse> createLandlord(@RequestBody com.apartment.management.features.accountmanagement.dto.CreateManagerRequest request) {
        return ResponseEntity.ok(service.createLandlord(request));
    }

    @GetMapping("/managers")
    @Operation(summary = "Get list of managers for current landlord")
    public ResponseEntity<List<ManagerResponse>> getManagers(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(service.getManagersByLandlord(userDetails.getAccountId()));
    }

    @PostMapping("/managers")
    @Operation(summary = "Create a new manager account and assign to buildings")
    public ResponseEntity<ManagerResponse> createManager(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody CreateManagerRequest request) {
        return ResponseEntity.ok(service.createManager(userDetails.getAccountId(), request));
    }

    @PutMapping("/managers/{id}")
    @Operation(summary = "Update an existing manager account")
    public ResponseEntity<ManagerResponse> updateManager(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestBody UpdateManagerRequest request) {
        return ResponseEntity.ok(service.updateManager(userDetails.getAccountId(), id, request));
    }
}
