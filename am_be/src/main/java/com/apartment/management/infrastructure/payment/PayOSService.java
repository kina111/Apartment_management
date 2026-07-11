package com.apartment.management.infrastructure.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.core.ClientOptions;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.webhooks.WebhookData;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PayOSService {

    @Value("${payos.client-id}")
    private String clientId;

    @Value("${payos.api-key}")
    private String apiKey;

    @Value("${payos.checksum-key}")
    private String checksumKey;

    private PayOS payOS;
    private boolean isMockMode = false;

    @PostConstruct
    public void init() {
        if ("mock-client-id".equals(clientId) || clientId == null || clientId.isEmpty()) {
            log.warn("PayOS configured in MOCK mode due to mock/missing credentials.");
            isMockMode = true;
        } else {
            try {
                ClientOptions options = ClientOptions.builder()
                        .clientId(clientId)
                        .apiKey(apiKey)
                        .checksumKey(checksumKey)
                        .build();
                this.payOS = new PayOS(options);
                log.info("PayOS initialized successfully.");
            } catch (Exception e) {
                log.error("Failed to initialize PayOS, falling back to mock mode", e);
                isMockMode = true;
            }
        }
    }

    public CreatePaymentLinkResponse createPaymentLink(CreatePaymentLinkRequest request) throws Exception {
        if (isMockMode) {
            log.info("[Mock Mode] Creating payment link for orderCode: {}", request.getOrderCode());
            // Create a mock response
            CreatePaymentLinkResponse response = new CreatePaymentLinkResponse();
            response.setOrderCode(request.getOrderCode());
            response.setAmount(request.getAmount());
            response.setPaymentLinkId("mock-link-" + request.getOrderCode());
            String encodedDesc = "";
            try {
                encodedDesc = java.net.URLEncoder.encode(request.getDescription(), java.nio.charset.StandardCharsets.UTF_8.toString());
            } catch (Exception e) {
                encodedDesc = request.getDescription();
            }
            response.setCheckoutUrl("http://localhost:5173/payment-simulation?invoiceId=" + request.getOrderCode() 
                    + "&amount=" + request.getAmount() 
                    + "&desc=" + encodedDesc);
            response.setQrCode("https://img.vietqr.io/image/MB-9999999999-compact2.png?amount=" + request.getAmount() + "&addInfo=" + request.getDescription());
            return response;
        }
        return payOS.paymentRequests().create(request);
    }

    public PaymentLink getPaymentLink(Long orderCode) throws Exception {
        if (isMockMode) {
            log.info("[Mock Mode] Getting payment link info for orderCode: {}", orderCode);
            PaymentLink link = new PaymentLink();
            link.setOrderCode(orderCode);
            link.setAmountPaid(0L);
            link.setAmountRemaining(100000L);
            link.setStatus(vn.payos.model.v2.paymentRequests.PaymentLinkStatus.PENDING);
            return link;
        }
        return payOS.paymentRequests().get(orderCode);
    }

    public PaymentLink cancelPaymentLink(Long orderCode, String reason) throws Exception {
        if (isMockMode) {
            log.info("[Mock Mode] Cancelling payment link for orderCode: {}", orderCode);
            PaymentLink link = new PaymentLink();
            link.setOrderCode(orderCode);
            link.setStatus(vn.payos.model.v2.paymentRequests.PaymentLinkStatus.CANCELLED);
            return link;
        }
        return payOS.paymentRequests().cancel(orderCode, reason);
    }

    public WebhookData verifyWebhookData(Object body) throws Exception {
        if (isMockMode) {
            log.info("[Mock Mode] Verifying webhook data");
            if (body instanceof WebhookData) {
                return (WebhookData) body;
            }
            // If body is a map, we construct a WebhookData or extract fields
            if (body instanceof java.util.Map) {
                java.util.Map<?, ?> map = (java.util.Map<?, ?>) body;
                java.util.Map<?, ?> dataMap = (java.util.Map<?, ?>) map.get("data");
                WebhookData data = new WebhookData();
                if (dataMap != null) {
                    if (dataMap.get("orderCode") != null) {
                        data.setOrderCode(Long.valueOf(dataMap.get("orderCode").toString()));
                    }
                    if (dataMap.get("amount") != null) {
                        data.setAmount(Long.valueOf(dataMap.get("amount").toString()));
                    }
                    data.setCode(dataMap.get("code") != null ? dataMap.get("code").toString() : "00");
                    data.setDesc(dataMap.get("desc") != null ? dataMap.get("desc").toString() : "Success");
                } else {
                    data.setOrderCode(12345L);
                    data.setAmount(100000L);
                    data.setCode("00");
                    data.setDesc("Success");
                }
                return data;
            }
            WebhookData data = new WebhookData();
            data.setOrderCode(12345L);
            data.setAmount(100000L);
            data.setCode("00");
            data.setDesc("Success");
            return data;
        }
        return payOS.webhooks().verify(body);
    }

    public boolean isMockMode() {
        return isMockMode;
    }
}
