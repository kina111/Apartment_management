package com.apartment.management.features.billing.controller;

import com.apartment.management.features.billing.dto.*;
import com.apartment.management.features.billing.service.IBillingService;
import com.apartment.management.shared.enums.PaymentStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Billing and Financial APIs")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class BillingController {

    private final IBillingService billingService;

    @Operation(summary = "Get Dashboard Stats", description = "Get financial and operation overview stats for UC-10")
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @RequestParam(value = "accountId", defaultValue = "2") Long accountId,
            @RequestParam(value = "buildingId", required = false) Long buildingId
    ) {
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account ID is required");
        }
        return ResponseEntity.ok(billingService.getDashboardStats(accountId, buildingId));
    }

    @Operation(summary = "Get Invoices", description = "Get list of invoices with advanced filters for UC-12")
    @GetMapping("/invoices")
    public ResponseEntity<PaginatedInvoicesResponse> getInvoices(
            @RequestParam(value = "accountId", defaultValue = "2") Long accountId,
            @RequestParam(value = "buildingId", required = false) Long buildingId,
            @RequestParam(value = "status", required = false) PaymentStatus status,
            @RequestParam(value = "month", required = false) String month,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account ID is required");
        }
        return ResponseEntity.ok(billingService.getInvoices(accountId, buildingId, status, month, search, page, size));
    }

    @Operation(summary = "Resend Invoice Email", description = "Resend the invoice notification email manually")
    @PutMapping("/invoices/{id}/resend-email")
    public ResponseEntity<InvoiceResponse> resendEmail(
            @RequestParam(value = "accountId", defaultValue = "2") Long accountId,
            @PathVariable("id") Long id
    ) {
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account ID is required");
        }
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice ID is required");
        }
        return ResponseEntity.ok(billingService.resendInvoiceEmail(accountId, id));
    }

    @Operation(summary = "Get Invoice Details", description = "Get single invoice details for UC-13")
    @GetMapping("/invoices/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceDetails(
            @RequestParam(value = "accountId", defaultValue = "2") Long accountId,
            @PathVariable("id") Long id
    ) {
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account ID is required");
        }
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice ID is required");
        }
        return ResponseEntity.ok(billingService.getInvoiceDetails(accountId, id));
    }

    @Operation(summary = "Update Invoice Status (Manual Payment Confirmation)", description = "Manually record payment method and update status to PAID for UC-13")
    @PutMapping("/invoices/{id}/status")
    public ResponseEntity<InvoiceResponse> updateInvoiceStatus(
            @RequestParam(value = "accountId", defaultValue = "2") Long accountId,
            @PathVariable("id") Long id,
            @RequestBody UpdateInvoiceStatusRequest request
    ) {
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account ID is required");
        }
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice ID is required");
        }
        if (request == null || request.getPaymentStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment status is required");
        }
        return ResponseEntity.ok(billingService.updateInvoiceStatus(accountId, id, request));
    }

    @Operation(summary = "Get Bulk Calculation Preview", description = "Preview calculated invoices for UC-14")
    @GetMapping("/calculate/preview")
    public ResponseEntity<List<InvoicePreviewResponse>> getCalculatePreview(
            @RequestParam(value = "accountId", defaultValue = "2") Long accountId,
            @RequestParam("buildingId") Long buildingId,
            @RequestParam("invoiceMonth") String invoiceMonth
    ) {
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account ID is required");
        }
        if (buildingId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Building ID is required");
        }
        if (invoiceMonth == null || invoiceMonth.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice month is required");
        }
        return ResponseEntity.ok(billingService.getCalculatePreview(accountId, buildingId, invoiceMonth));
    }

    @Operation(summary = "Issue Invoices in Bulk", description = "Generate and publish invoices in bulk for UC-14")
    @PostMapping("/calculate/issue")
    public ResponseEntity<List<InvoiceResponse>> issueInvoices(
            @RequestParam(value = "accountId", defaultValue = "2") Long accountId,
            @RequestBody IssueInvoicesRequest request
    ) {
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account ID is required");
        }
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (request.getBuildingId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Building ID is required");
        }
        if (request.getInvoiceMonth() == null || request.getInvoiceMonth().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice month is required");
        }
        if (request.getRooms() == null || request.getRooms().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room calculation inputs are required");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(billingService.issueInvoices(accountId, request));
    }

    @Operation(summary = "Void Invoice", description = "Change invoice status to VOID to cancel it for UC-14.2")
    @PutMapping("/invoices/{id}/void")
    public ResponseEntity<InvoiceResponse> voidInvoice(
            @RequestParam(value = "accountId", defaultValue = "2") Long accountId,
            @PathVariable("id") Long id
    ) {
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account ID is required");
        }
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice ID is required");
        }
        return ResponseEntity.ok(billingService.voidInvoice(accountId, id));
    }
}
