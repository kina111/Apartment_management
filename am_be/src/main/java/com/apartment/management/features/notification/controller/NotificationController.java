package com.apartment.management.features.notification.controller;

import com.apartment.management.features.notification.dto.EmailRequest;
import com.apartment.management.features.notification.dto.EmailConfigurationRequest;
import com.apartment.management.features.notification.dto.TargetListResponse;
import com.apartment.management.features.notification.dto.TargetItem;
import com.apartment.management.features.notification.service.NotificationService;
import com.apartment.management.shared.service.CurrentUserService;
import com.apartment.management.features.notification.repository.EmailConfigurationRepository;
import com.apartment.management.shared.entity.EmailConfiguration;
import com.apartment.management.features.building.repository.BuildingRepository;
import com.apartment.management.shared.entity.Building;
import com.apartment.management.features.tenants_vehicles.repository.TenantRepository;
import com.apartment.management.features.auth.repository.AccountRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification", description = "Notification Management API")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;
    private final EmailConfigurationRepository emailConfigurationRepository;
    private final BuildingRepository buildingRepository;
    private final TenantRepository tenantRepository;
    private final AccountRepository accountRepository;

    @PostMapping(value = "/send", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('LANDLORD')")
    @Operation(summary = "Send flexible notification to tenants/managers (Landlord only)")
    public ResponseEntity<?> sendFlexibleNotification(@ModelAttribute EmailRequest request) {
        Long landlordId = currentUserService.getCurrentUserId();
        
        // This process is asynchronous, so it returns OK immediately
        notificationService.sendFlexibleNotification(request, landlordId);
        
        return ResponseEntity.ok("Gửi thông báo thành công (Quá trình gửi đang diễn ra ngầm).");
    }

    @GetMapping("/email-config/{buildingId}")
    @PreAuthorize("hasRole('LANDLORD')")
    @Operation(summary = "Get Email Configuration for a building")
    public ResponseEntity<?> getEmailConfig(@PathVariable Long buildingId) {
        return emailConfigurationRepository.findByBuilding_BuildingId(buildingId)
                .map(config -> {
                    EmailConfigurationRequest res = new EmailConfigurationRequest();
                    res.setSenderEmail(config.getSenderEmail());
                    res.setSenderPassword(config.getSenderPassword());
                    return ResponseEntity.ok(res);
                })
                .orElseGet(() -> ResponseEntity.ok(new EmailConfigurationRequest()));
    }

    @PostMapping("/email-config/{buildingId}")
    @PreAuthorize("hasRole('LANDLORD')")
    @Operation(summary = "Save or Update Email Configuration for a building")
    public ResponseEntity<?> saveEmailConfig(@PathVariable Long buildingId, @RequestBody EmailConfigurationRequest request) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tòa nhà"));

        EmailConfiguration config = emailConfigurationRepository.findByBuilding_BuildingId(buildingId)
                .orElse(EmailConfiguration.builder().building(building).build());

        config.setSenderEmail(request.getSenderEmail());
        config.setSenderPassword(request.getSenderPassword());

        emailConfigurationRepository.save(config);
        return ResponseEntity.ok("Lưu cấu hình Email thành công");
    }

    @GetMapping("/targets/{buildingId}")
    @PreAuthorize("hasRole('LANDLORD')")
    @Operation(summary = "Get managers and tenants for specific building")
    public ResponseEntity<TargetListResponse> getTargets(@PathVariable Long buildingId) {
        TargetListResponse response = new TargetListResponse();
        
        response.setTenants(tenantRepository.findTenantsByBuildingId(buildingId).stream()
                .map(t -> new TargetItem(t.getTenantId(), t.getName(), t.getEmail()))
                .collect(Collectors.toList()));
                
        response.setManagers(accountRepository.findManagersByBuildingId(buildingId).stream()
                .map(a -> new TargetItem(a.getAccountId(), a.getAccountName(), a.getEmail()))
                .collect(Collectors.toList()));
                
        return ResponseEntity.ok(response);
    }
}
