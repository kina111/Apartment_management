package com.apartment.management.features.billing.service;

import com.apartment.management.features.billing.dto.*;
import com.apartment.management.shared.enums.PaymentStatus;

import java.util.List;

public interface IBillingService {
    DashboardStatsResponse getDashboardStats(Long accountId, Long buildingId);
    PaginatedInvoicesResponse getInvoices(Long accountId, Long buildingId, PaymentStatus status, String month, String search, int page, int size);
    InvoiceResponse getInvoiceDetails(Long accountId, Long invoiceId);
    InvoiceResponse updateInvoiceStatus(Long accountId, Long invoiceId, UpdateInvoiceStatusRequest request);
    List<InvoicePreviewResponse> getCalculatePreview(Long accountId, Long buildingId, String month);
    List<InvoiceResponse> issueInvoices(Long accountId, IssueInvoicesRequest request);
    InvoiceResponse voidInvoice(Long accountId, Long invoiceId);
    InvoiceResponse resendInvoiceEmail(Long accountId, Long invoiceId);
}
