package com.apartment.management.features.notification.repository;

import com.apartment.management.shared.entity.EmailConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailConfigurationRepository extends JpaRepository<EmailConfiguration, Long> {
    Optional<EmailConfiguration> findByBuilding_BuildingId(Long buildingId);
}
