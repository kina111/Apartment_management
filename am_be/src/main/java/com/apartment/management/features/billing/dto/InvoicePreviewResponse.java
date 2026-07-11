package com.apartment.management.features.billing.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class InvoicePreviewResponse {
    private String roomCode;
    private Long contractId;
    private String tenantName;
    private BigDecimal roomRent;
    private Integer oldElectricityIndex;
    private BigDecimal electricityPrice;
    private Integer oldWaterIndex;
    private BigDecimal waterPrice;
    private BigDecimal additionalFee;
    private String additionalFeeNote;
    private List<OtherFeeDto> otherServiceFees;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @ToString
    public static class OtherFeeDto {
        private String name;
        private BigDecimal fee;
        private String chargeType;
    }
}
