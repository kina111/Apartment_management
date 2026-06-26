package com.apartment.management.features.tenants_vehicles.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apartment.management.shared.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByTenantTenantId(Long tenantId);
}
