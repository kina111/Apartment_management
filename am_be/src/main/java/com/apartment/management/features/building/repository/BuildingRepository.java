package com.apartment.management.features.building.repository;

import com.apartment.management.shared.entity.Building;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface BuildingRepository extends JpaRepository<Building, Long>, JpaSpecificationExecutor<Building> {
    @Query("SELECT b FROM Building b JOIN b.managers m WHERE m.accountId = :managerId")
    List<Building> findByManagerId(Long managerId);

    List<Building> findAllByLandlord_AccountId(Long landlordId);

    @EntityGraph(attributePaths = "images")
    Optional<Building> findByBuildingIdAndLandlord_AccountId(Long buildingId, Long landlordId);

    @EntityGraph(attributePaths = {"images", "managers"})
    Optional<Building> findByBuildingId(Long buildingId);
}
