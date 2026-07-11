package com.apartment.management.features.billing.dto;

import com.apartment.management.shared.enums.PaymentMethod;
import com.apartment.management.shared.enums.PaymentStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class UpdateInvoiceStatusRequest {
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
}
