package com.apartment.management.features.building.repository;

import com.apartment.management.shared.entity.Building;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BuildingRepository extends JpaRepository<Building, Long> {
    @Query("SELECT b FROM Building b JOIN b.managers m WHERE m.accountId = :managerId")
    List<Building> findByManagerId(Long managerId);

    List<Building> findAllByLandlord_AccountId(Long landlordId);
}
