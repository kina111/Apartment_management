package com.apartment.management.features.billing.controller;

import com.apartment.management.features.billing.repository.InvoiceRepository;
import com.apartment.management.infrastructure.payment.PayOSService;
import com.apartment.management.shared.entity.Invoice;
import com.apartment.management.shared.enums.PaymentMethod;
import com.apartment.management.shared.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.model.webhooks.WebhookData;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/webhook")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class PayOSWebhookController {

    private final PayOSService payOSService;
    private final InvoiceRepository invoiceRepository;

    @PostMapping("/payos")
    public ResponseEntity<?> handlePayOSWebhook(@RequestBody Map<String, Object> body) {
        log.info("Received PayOS Webhook payload: {}", body);
        try {
            // Verify webhook signature and extract payload
            WebhookData webhookData = payOSService.verifyWebhookData(body);
            log.info("PayOS Webhook verified. Data: {}", webhookData);

            if ("00".equals(webhookData.getCode())) {
                Long invoiceId = webhookData.getOrderCode();
                Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);

                if (invoiceOpt.isPresent()) {
                    Invoice invoice = invoiceOpt.get();
                    if (invoice.getPaymentStatus() == PaymentStatus.PENDING) {
                        invoice.setPaymentStatus(PaymentStatus.PAID);
                        invoice.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
                        invoiceRepository.save(invoice);
                        log.info("Invoice ID {} successfully paid and updated via PayOS webhook.", invoiceId);
                    } else {
                        log.info("Invoice ID {} status is already {}. Skipping status update.", invoiceId, invoice.getPaymentStatus());
                    }
                } else {
                    log.warn("Invoice ID {} not found for PayOS webhook.", invoiceId);
                }
            } else {
                log.warn("PayOS webhook code is not success: {}", webhookData.getCode());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Webhook processed successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error processing PayOS webhook", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
