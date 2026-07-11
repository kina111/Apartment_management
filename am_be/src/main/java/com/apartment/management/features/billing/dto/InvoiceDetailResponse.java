package com.apartment.management.features.billing.dto;

import com.apartment.management.shared.enums.ChargeType;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class InvoiceDetailResponse {
    private Long invoiceDetailId;
    private String itemName;
    private ChargeType chargeType;
    private BigDecimal unitPrice;
    private BigDecimal quantity;
    private Integer oldIndex;
    private Integer newIndex;
    private BigDecimal subTotal;
}
