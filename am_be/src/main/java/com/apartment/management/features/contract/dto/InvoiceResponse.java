package com.apartment.management.features.contract.dto;

import java.math.BigDecimal;
import java.util.Set;

import com.apartment.management.shared.enums.PaymentMethod;
import com.apartment.management.shared.enums.PaymentStatus;

public record InvoiceResponse(
    Long invoiceId,
    String invoiceMonth,
    BigDecimal totalAmount,
    PaymentStatus paymentStatus,
    String paymentUrlQrCode,
    PaymentMethod paymentMethod,
    Set<Long> detailIds
) {
    
}
