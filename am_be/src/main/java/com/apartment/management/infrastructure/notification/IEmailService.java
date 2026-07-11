package com.apartment.management.infrastructure.notification;

import com.apartment.management.shared.entity.Contract;
import com.apartment.management.shared.entity.Invoice;

public interface IEmailService {
    void sendInvoiceEmail(Contract contract, Invoice invoice);
    void sendMockInvoiceEmail(Contract contract, Invoice invoice);
    void sendContractExpiryEmail(Contract contract, com.apartment.management.shared.entity.Tenant tenant);
}
