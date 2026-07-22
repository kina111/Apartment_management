package com.apartment.management.features.accountmanagement.service;

import com.apartment.management.features.accountmanagement.dto.CreateManagerRequest;
import com.apartment.management.features.accountmanagement.dto.ManagerResponse;
import com.apartment.management.features.accountmanagement.dto.UpdateManagerRequest;
import com.apartment.management.features.auth.repository.AccountRepository;
import com.apartment.management.features.building.repository.BuildingRepository;
import com.apartment.management.shared.entity.Account;
import com.apartment.management.shared.entity.Building;
import com.apartment.management.shared.enums.AccountStatus;
import com.apartment.management.shared.enums.Role;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
public class AccountManagementService {

    private final AccountRepository accountRepository;
    private final BuildingRepository buildingRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountManagementService(AccountRepository accountRepository,
                                    BuildingRepository buildingRepository,
                                    PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.buildingRepository = buildingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<ManagerResponse> getManagersByLandlord(Long landlordId) {
        List<Account> managers = accountRepository.findManagersByLandlordId(landlordId);
        return managers.stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public ManagerResponse createLandlord(CreateManagerRequest request) {
        if (accountRepository.existsByAccountName(request.accountName())) {
            throw new IllegalArgumentException("Account name already exists");
        }
        if (accountRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Account landlord = Account.builder()
                .accountName(request.accountName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.LANDLORD)
                .status(AccountStatus.ACTIVE)
                .build();

        Account saved = accountRepository.save(landlord);
        return mapToResponse(saved);
    }

    @Transactional
    public ManagerResponse createManager(Long landlordId, CreateManagerRequest request) {
        if (accountRepository.existsByAccountName(request.accountName())) {
            throw new IllegalArgumentException("Account name already exists");
        }
        if (accountRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (request.buildingIds() == null || request.buildingIds().isEmpty()) {
            throw new IllegalArgumentException("At least one building must be assigned to the manager");
        }

        // Validate buildings belong to landlord
        List<Building> selectedBuildings = buildingRepository.findAllById(request.buildingIds());
        for (Building b : selectedBuildings) {
            if (!b.getLandlord().getAccountId().equals(landlordId)) {
                throw new IllegalArgumentException("Cannot assign building you do not own: " + b.getBuildingId());
            }
        }

        Account manager = Account.builder()
                .accountName(request.accountName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.MANAGER)
                .status(AccountStatus.ACTIVE)
                .buildings(new HashSet<>(selectedBuildings))
                .build();

        Account saved = accountRepository.save(manager);
        return mapToResponse(saved);
    }

    @Transactional
    public ManagerResponse updateManager(Long landlordId, Long managerId, UpdateManagerRequest request) {
        Account manager = accountRepository.findById(managerId)
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        if (!manager.getRole().equals(Role.MANAGER)) {
            throw new IllegalArgumentException("Account is not a manager");
        }

        // Validate buildings belong to landlord
        List<Building> selectedBuildings = buildingRepository.findAllById(request.buildingIds());
        for (Building b : selectedBuildings) {
            if (!b.getLandlord().getAccountId().equals(landlordId)) {
                throw new IllegalArgumentException("Cannot assign building you do not own: " + b.getBuildingId());
            }
        }

        manager.setAccountName(request.accountName());
        manager.setEmail(request.email());
        manager.setStatus(AccountStatus.valueOf(request.status()));
        manager.getBuildings().clear();
        manager.getBuildings().addAll(selectedBuildings);

        if (request.password() != null && !request.password().trim().isEmpty()) {
            manager.setPassword(passwordEncoder.encode(request.password()));
        }

        return mapToResponse(manager);
    }

    @Transactional
    public void deleteManager(Long landlordId, Long managerId) {
        Account manager = accountRepository.findById(managerId)
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        if (!manager.getRole().equals(Role.MANAGER)) {
            throw new IllegalArgumentException("Account is not a manager");
        }

        // Verify that this manager is associated with buildings owned by this landlord
        // Or simply checking if the manager has any building that belongs to this landlord
        boolean ownsManager = manager.getBuildings().stream()
                .anyMatch(b -> b.getLandlord().getAccountId().equals(landlordId));

        // Wait, what if they manage 0 buildings? We can check if they were created by this landlord.
        // Actually, our requirement says landlord manages everything, if they delete, no constraint.
        // But for security, we should ensure the landlord has the right to delete.
        // If the manager has NO buildings, it's an edge case, we'll allow deletion if they manage 0 or at least 1 of landlord's buildings.
        if (!manager.getBuildings().isEmpty() && !ownsManager) {
            throw new IllegalArgumentException("You do not have permission to delete this manager");
        }

        // Clear buildings to remove relationships in Account_Buildings join table
        manager.getBuildings().clear();

        // Delete the account
        accountRepository.delete(manager);
    }

    private ManagerResponse mapToResponse(Account account) {
        List<ManagerResponse.BuildingInfo> buildings = account.getBuildings().stream()
                .map(b -> new ManagerResponse.BuildingInfo(b.getBuildingId(), b.getName()))
                .toList();

        return new ManagerResponse(
                account.getAccountId(),
                account.getAccountName(),
                account.getEmail(),
                account.getStatus().name(),
                buildings
        );
    }
}
