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
public class IssueInvoicesRequest {
    private Long buildingId;
    private String invoiceMonth;
    private java.time.LocalDate issueDate;
    private java.time.LocalDate dueDate;
    private List<RoomCalculationInput> rooms;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @ToString
    public static class RoomCalculationInput {
        private String roomCode;
        private Long contractId;
        private Integer newElectricityIndex;
        private Integer newWaterIndex;
        private BigDecimal additionalFee;
        private String additionalFeeNote;
        private BigDecimal roomRent;
    }
}
