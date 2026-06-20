package com.apartment.management.features.building.repository;

import com.apartment.management.shared.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {
}
