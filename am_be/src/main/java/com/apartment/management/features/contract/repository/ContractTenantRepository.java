package com.apartment.management.features.contract.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.apartment.management.shared.entity.ContractTenant;

public interface ContractTenantRepository extends JpaRepository<ContractTenant, Long> {

    @Query("SELECT ct FROM ContractTenant ct JOIN FETCH ct.tenant JOIN FETCH ct.contract WHERE ct.contract.contractId = :contractId")
    Optional<ContractTenant> findByContractId(Long contractId);
}

