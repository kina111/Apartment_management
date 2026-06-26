package com.apartment.management.features.contract.dto;

import java.math.BigDecimal;

import com.apartment.management.shared.enums.ChargeType;

public record InvoiceDetailResponse(
    Long invoiceDetailId,
    String itemName,
    ChargeType chargeType,
    BigDecimal unitPrice,
    BigDecimal quantity,
    Integer oldIndex,
    Integer newIndex,
    BigDecimal subTotal
) {

}
