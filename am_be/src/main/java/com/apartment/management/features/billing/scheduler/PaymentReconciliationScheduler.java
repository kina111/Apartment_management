package com.apartment.management.features.billing.scheduler;

import com.apartment.management.features.billing.repository.InvoiceRepository;
import com.apartment.management.infrastructure.payment.PayOSService;
import com.apartment.management.shared.entity.Invoice;
import com.apartment.management.shared.enums.PaymentMethod;
import com.apartment.management.shared.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.model.v2.paymentRequests.PaymentLink;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentReconciliationScheduler {

    private final InvoiceRepository invoiceRepository;
    private final PayOSService payOSService;

    /**
     * Reconcile pending invoices with PayOS payment status.
     * Runs every 5 minutes by default.
     */
    @Scheduled(fixedDelayString = "${app.scheduler.reconciliation-delay:300000}")
    @Transactional
    public void reconcilePayments() {
        log.info("Starting PaymentReconciliationScheduler task...");
        List<Invoice> pendingInvoices = invoiceRepository.findByPaymentStatus(PaymentStatus.PENDING);
        if (pendingInvoices.isEmpty()) {
            log.info("No pending invoices found for reconciliation.");
            return;
        }

        log.info("Found {} pending invoices to reconcile.", pendingInvoices.size());
        for (Invoice invoice : pendingInvoices) {
            if (invoice.getPaymentUrlQrCode() == null || !invoice.getPaymentUrlQrCode().contains("payos.vn")) {
                continue;
            }

            try {
                log.info("Checking status of invoice ID {} on PayOS...", invoice.getInvoiceId());
                PaymentLink paymentLink = payOSService.getPaymentLink(invoice.getInvoiceId());
                String status = paymentLink.getStatus().name();
                log.info("Invoice ID {} PayOS status: {}", invoice.getInvoiceId(), status);

                if ("PAID".equals(status)) {
                    invoice.setPaymentStatus(PaymentStatus.PAID);
                    invoice.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
                    invoiceRepository.save(invoice);
                    log.info("Invoice ID {} successfully reconciled to PAID.", invoice.getInvoiceId());
                } else if ("CANCELLED".equals(status)) {
                    log.info("Invoice ID {} PayOS payment link cancelled.", invoice.getInvoiceId());
                }
            } catch (Exception e) {
                log.error("Failed to reconcile invoice ID " + invoice.getInvoiceId() + " with PayOS", e);
            }
        }
        log.info("PaymentReconciliationScheduler task finished.");
    }
}
