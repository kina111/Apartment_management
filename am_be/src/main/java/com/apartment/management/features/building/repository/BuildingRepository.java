package com.apartment.management.features.building.repository;

import com.apartment.management.shared.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BuildingRepository extends JpaRepository<Building, Long> {
}
