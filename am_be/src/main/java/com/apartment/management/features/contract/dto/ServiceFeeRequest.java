package com.apartment.management.features.contract.dto;

import com.apartment.management.shared.enums.ChargeType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ServiceFeeRequest {
    private String name;
    private BigDecimal fee;
    private ChargeType chargeType;
}
