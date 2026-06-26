package com.apartment.management.features.contract.dto;

import java.time.LocalDate;

public record ContractTenantResponse(
        Long contractTenantId,
        Boolean isContractHolder,
        LocalDate joinDate,
        LocalDate leaveDate,
        Long tenantId,
        Long contractId
    ) {

}
