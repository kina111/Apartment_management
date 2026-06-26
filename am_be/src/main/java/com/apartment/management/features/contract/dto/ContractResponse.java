package com.apartment.management.features.contract.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import com.apartment.management.shared.enums.ContractStatus;

public record ContractResponse(
                Long contractId,
                BigDecimal rent,
                BigDecimal depositAmount,
                LocalDate startDate,
                LocalDate endDate,
                ContractStatus status,
                Set<ServiceFeeResponse> serviceFees,
                Set<ContractImageResponse> images,
                Set<InvoiceResponse> invoices,
                Set<Long> contractTenantIds,
                Long parentContractId,
                Set<Long> renewalContractIds) {

}
