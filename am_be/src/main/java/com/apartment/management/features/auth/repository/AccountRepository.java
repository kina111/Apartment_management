package com.apartment.management.features.auth.repository;

import com.apartment.management.shared.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByAccountName(String accountName);
    boolean existsByAccountName(String accountName);
    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Account a JOIN a.buildings b WHERE b.landlord.accountId = :landlordId AND a.role = 'MANAGER'")
    java.util.List<Account> findManagersByLandlordId(Long landlordId);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Account a JOIN a.buildings b WHERE b.buildingId = :buildingId AND a.role = 'MANAGER'")
    java.util.List<Account> findManagersByBuildingId(Long buildingId);
}
