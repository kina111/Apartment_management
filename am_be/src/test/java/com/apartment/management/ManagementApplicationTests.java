package com.apartment.management;

import com.apartment.management.features.billing.controller.PayOSWebhookController;
import com.apartment.management.features.billing.dto.IssueInvoicesRequest;
import com.apartment.management.features.billing.dto.InvoiceResponse;
import com.apartment.management.features.billing.repository.InvoiceRepository;
import com.apartment.management.features.billing.scheduler.PaymentReconciliationScheduler;
import com.apartment.management.features.billing.service.IBillingService;
import com.apartment.management.features.contract.repository.ContractRepository;
import com.apartment.management.features.contract.scheduler.ContractExpiryScheduler;
import com.apartment.management.features.room.repository.RoomRepository;
import com.apartment.management.shared.entity.Account;
import com.apartment.management.shared.entity.Contract;
import com.apartment.management.shared.entity.Invoice;
import com.apartment.management.shared.entity.Room;
import com.apartment.management.shared.enums.ContractStatus;
import com.apartment.management.shared.enums.PaymentMethod;
import com.apartment.management.shared.enums.PaymentStatus;
import com.apartment.management.shared.enums.RoomStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ManagementApplicationTests {

    @Autowired
    private IBillingService billingService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private PayOSWebhookController webhookController;

    @Autowired
    private PaymentReconciliationScheduler reconciliationScheduler;

    @Autowired
    private ContractExpiryScheduler contractExpiryScheduler;

    @Test
    @Transactional
    void testEndToEndBillingAndReconciliationFlow() throws Exception {
        List<Contract> contracts = contractRepository.findAll();
        assertThat(contracts).isNotEmpty();

        Contract contract = contracts.stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .findFirst()
                .orElse(null);
        assertThat(contract).isNotNull();

        Room room = contract.getRoom();
        assertThat(room).isNotNull();

        Account landlord = room.getBuilding().getLandlord();
        assertThat(landlord).isNotNull();

        // 1. Issue an Invoice for the room
        IssueInvoicesRequest.RoomCalculationInput input = IssueInvoicesRequest.RoomCalculationInput.builder()
                .roomCode(room.getRoomCode())
                .contractId(contract.getContractId())
                .roomRent(BigDecimal.valueOf(3000000))
                .newElectricityIndex(150)
                .newWaterIndex(80)
                .additionalFee(BigDecimal.valueOf(50000))
                .additionalFeeNote("Phu phi")
                .build();

        IssueInvoicesRequest request = IssueInvoicesRequest.builder()
                .buildingId(room.getBuilding().getBuildingId())
                .invoiceMonth("2026/07")
                .dueDate(LocalDate.now().plusDays(10))
                .rooms(Collections.singletonList(input))
                .build();

        List<InvoiceResponse> issued = billingService.issueInvoices(landlord.getAccountId(), request);
        assertThat(issued).hasSize(1);
        InvoiceResponse response = issued.getFirst();
        assertThat(response.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(response.getPaymentUrlQrCode()).contains("payos.vn");

        // Verify it was stored in the database
        Invoice invoice = invoiceRepository.findById(response.getInvoiceId()).orElse(null);
        assertThat(invoice).isNotNull();
        assertThat(invoice.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);

        // 2. Trigger PayOS Webhook
        Map<String, Object> webhookBody = new HashMap<>();
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("orderCode", invoice.getInvoiceId());
        dataMap.put("amount", invoice.getTotalAmount().longValue());
        dataMap.put("code", "00");
        dataMap.put("desc", "Success");
        webhookBody.put("data", dataMap);

        webhookController.handlePayOSWebhook(webhookBody);

        // Verify status updated to PAID
        Invoice updatedInvoice = invoiceRepository.findById(invoice.getInvoiceId()).orElse(null);
        assertThat(updatedInvoice).isNotNull();
        assertThat(updatedInvoice.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(updatedInvoice.getPaymentMethod()).isEqualTo(PaymentMethod.BANK_TRANSFER);
    }

    @Test
    @Transactional
    void testContractExpiryScheduler() {
        List<Contract> contracts = contractRepository.findAll();
        Contract contract = contracts.stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .findFirst()
                .orElse(null);
        assertThat(contract).isNotNull();

        contract.setEndDate(LocalDate.now().minusDays(1));
        contractRepository.saveAndFlush(contract);

        Room room = contract.getRoom();
        room.setStatus(RoomStatus.RENTED);
        roomRepository.saveAndFlush(room);

        // Run scheduler
        contractExpiryScheduler.checkContractExpiry();

        // Verify contract is now EXPIRED and Room is AVAILABLE
        Contract expiredContract = contractRepository.findById(contract.getContractId()).orElse(null);
        assertThat(expiredContract).isNotNull();
        assertThat(expiredContract.getStatus()).isEqualTo(ContractStatus.EXPIRED);

        Room updatedRoom = roomRepository.findById(room.getRoomCode()).orElse(null);
        assertThat(updatedRoom).isNotNull();
        assertThat(updatedRoom.getStatus()).isEqualTo(RoomStatus.AVAILABLE);
    }
}
