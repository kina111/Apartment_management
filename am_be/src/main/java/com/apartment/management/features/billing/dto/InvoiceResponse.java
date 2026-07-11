package com.apartment.management.features.billing.dto;

import com.apartment.management.shared.enums.MailStatus;
import com.apartment.management.shared.enums.PaymentMethod;
import com.apartment.management.shared.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class InvoiceResponse {
    private Long invoiceId;
    private String invoiceMonth;
    private BigDecimal totalAmount;
    private PaymentStatus paymentStatus;
    private String paymentUrlQrCode;
    private PaymentMethod paymentMethod;
    private Long contractId;
    private String roomCode;
    private String buildingName;
    private String tenantName;
    private java.time.LocalDate issueDate;
    private java.time.LocalDate dueDate;
    private MailStatus mailStatus;
    private List<InvoiceDetailResponse> details;
}
