package com.apartment.management.features.tenants_vehicles.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.apartment.management.shared.entity.Tenant;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    @Query("SELECT t FROM Tenant t JOIN t.contractTenants ct WHERE ct.contractTenantId = :contractTenantId")
    @EntityGraph(attributePaths = {"emergencyContacts", "vehicles", "contractTenants"})
    Tenant findByContractTenantId(Long contractTenantId);

    @Query("SELECT DISTINCT t FROM Tenant t JOIN t.contractTenants ct WHERE ct.contract.contractId = :contractId")
    @EntityGraph(attributePaths = {"emergencyContacts", "vehicles", "contractTenants"})
    List<Tenant> findByContractId(Long contractId);

    @Query("SELECT DISTINCT t FROM Tenant t")
    @EntityGraph(attributePaths = {"emergencyContacts", "vehicles", "contractTenants"})
    List<Tenant> findAllWithDetails();

    @Query("SELECT ct.isContractHolder FROM ContractTenant ct WHERE ct.tenant.tenantId = :tenantId AND ct.contract.contractId = :contractId")
    Boolean isContractHolder(Long tenantId, Long contractId);

    @Query("SELECT t FROM Tenant t JOIN t.contractTenants ct WHERE ct.contract.contractId = :contractId AND ct.leaveDate IS NULL")
    @EntityGraph(attributePaths = {"emergencyContacts", "vehicles", "contractTenants"})
    List<Tenant> findTenantsDoNotLeaveByContractId(Long contractId);

    // Trả Object[]{Tenant, Boolean isContractHolder} trong 1 query — không N+1
    // JOIN FETCH thay cho @EntityGraph vì @EntityGraph không hỗ trợ return Object[]
    @Query("""
            SELECT DISTINCT t, ct.isContractHolder
            FROM Tenant t
            LEFT JOIN FETCH t.emergencyContacts
            LEFT JOIN FETCH t.vehicles
            LEFT JOIN FETCH t.contractTenants
            JOIN t.contractTenants ct
            JOIN ct.contract c
            JOIN c.room r
            WHERE r.building.buildingId = :buildingId
              AND ct.leaveDate IS NULL
            """)
    List<Object[]> findTenantsWithHolderStatusByBuildingId(Long buildingId);
}

