package com.apartment.management.features.billing.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class BulkCalculatePreviewRequest {
    private Long buildingId;
    private String invoiceMonth;
    private BigDecimal additionalFee;
    private String additionalFeeNote;
}
