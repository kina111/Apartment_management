package com.apartment.management.features.contract.dto;

import java.math.BigDecimal;

import com.apartment.management.shared.enums.ChargeType;

public record ServiceFeeResponse(
    Long serviceFeeId,
    String name,
    BigDecimal fee,
    ChargeType chargeType
) {

}
