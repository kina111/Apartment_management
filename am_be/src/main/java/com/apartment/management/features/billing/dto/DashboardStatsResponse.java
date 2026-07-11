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
public class DashboardStatsResponse {
    private BigDecimal totalRevenue;
    private BigDecimal actualCashFlow;
    private Integer totalRooms;
    private Integer occupiedRooms;
    private BigDecimal occupancyRate;
    private Integer unpaidInvoiceCount;
    private List<UnpaidRoomDto> unpaidRooms;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @ToString
    public static class UnpaidRoomDto {
        private Long invoiceId;
        private String roomCode;
        private String buildingName;
        private String tenantName;
        private BigDecimal unpaidAmount;
        private String invoiceMonth;
        private String status;
    }
}
