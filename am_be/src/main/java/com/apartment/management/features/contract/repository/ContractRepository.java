package com.apartment.management.features.contract.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.apartment.management.shared.entity.Contract;
import com.apartment.management.shared.enums.ContractStatus;

import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long>, JpaSpecificationExecutor<Contract> {

    @Query("SELECT DISTINCT c FROM Contract c")
    @EntityGraph(attributePaths = {
            "contractTenants",
            "renewalContracts",
            "serviceFees",
            "images",
            "invoices",
            "invoices.details"
    })
    List<Contract> findAllWithDetails();

    @Query("SELECT DISTINCT c FROM Contract c WHERE c.room.roomCode = :roomCode")
    @EntityGraph(attributePaths = {
            "contractTenants",
            "renewalContracts",
            "serviceFees",
            "images",
            "invoices",
            "invoices.details"
    })
    Optional<List<Contract>> findByRoomCode(String roomCode);

    @Query("SELECT c FROM Contract c WHERE c.room.roomCode = :roomCode AND c.status = :status")
    @EntityGraph(attributePaths = {
            "contractTenants",
            "renewalContracts",
            "serviceFees",
            "images",
            "invoices",
            "invoices.details"
    })
    Optional<Contract> findByRoomCodeAndStatus(String roomCode, ContractStatus status);

    boolean existsByRoom_Building_BuildingIdAndStatus(Long buildingId, ContractStatus status);
}
