package com.apartment.management.features.billing.service.impl;

import com.apartment.management.features.billing.dto.*;
import com.apartment.management.features.billing.mapper.InvoiceMapper;
import com.apartment.management.features.billing.repository.InvoiceRepository;
import com.apartment.management.features.billing.repository.InvoiceSpecification;
import com.apartment.management.features.billing.service.IBillingService;
import com.apartment.management.features.building.repository.AccountRepository;
import com.apartment.management.features.building.repository.BuildingRepository;
import com.apartment.management.infrastructure.notification.IEmailService;
import com.apartment.management.shared.entity.*;
import com.apartment.management.shared.enums.ChargeType;
import com.apartment.management.shared.enums.ContractStatus;
import com.apartment.management.shared.enums.MailStatus;
import com.apartment.management.shared.enums.PaymentStatus;
import com.apartment.management.shared.enums.Role;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import com.apartment.management.infrastructure.payment.PayOSService;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements IBillingService {

    private static final Logger log = LoggerFactory.getLogger(BillingServiceImpl.class);

    private final InvoiceRepository invoiceRepository;
    private final BuildingRepository buildingRepository;
    private final AccountRepository accountRepository;
    private final IEmailService emailService;
    private final InvoiceMapper invoiceMapper;
    private final PayOSService payOSService;

    @Value("${vietqr.default.bank}")
    private String defaultBank;

    @Value("${vietqr.default.account}")
    private String defaultAccount;

    @Value("${vietqr.default.name}")
    private String defaultName;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(Long accountId, Long buildingId) {
        List<Long> buildingIds = getAuthorizedBuildingIds(accountId, buildingId);
        if (buildingIds.isEmpty()) {
            return DashboardStatsResponse.builder()
                    .totalRevenue(BigDecimal.ZERO)
                    .actualCashFlow(BigDecimal.ZERO)
                    .totalRooms(0)
                    .occupiedRooms(0)
                    .occupancyRate(BigDecimal.ZERO)
                    .unpaidInvoiceCount(0)
                    .unpaidRooms(new ArrayList<>())
                    .build();
        }

        BigDecimal totalRevenue = invoiceRepository.sumTotalAmountByBuildingIds(buildingIds);
        BigDecimal actualCashFlow = invoiceRepository.sumPaidAmountByBuildingIds(buildingIds);

        // Fetch room counts
        int totalRooms = 0;
        int occupiedRooms = 0;
        List<Building> buildings = buildingRepository.findAllById(buildingIds);
        for (Building b : buildings) {
            totalRooms += b.getRooms().size();
            for (Room r : b.getRooms()) {
                if (r.getStatus() != null && r.getStatus().name().equals("RENTED")) {
                    occupiedRooms++;
                }
            }
        }

        BigDecimal occupancyRate = BigDecimal.ZERO;
        if (totalRooms > 0) {
            occupancyRate = BigDecimal.valueOf(occupiedRooms)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalRooms), 2, RoundingMode.HALF_UP);
        }

        // Fetch unpaid invoices
        List<Invoice> unpaidInvoices = invoiceRepository.findUnpaidInvoicesByBuildingIds(buildingIds);
        List<DashboardStatsResponse.UnpaidRoomDto> unpaidRoomsList = new ArrayList<>();
        for (Invoice i : unpaidInvoices) {
            Contract c = i.getContract();
            Room r = c.getRoom();
            unpaidRoomsList.add(DashboardStatsResponse.UnpaidRoomDto.builder()
                    .invoiceId(i.getInvoiceId())
                    .roomCode(r.getRoomCode())
                    .buildingName(r.getBuilding().getName())
                    .tenantName(invoiceMapper.getContractHolderName(c))
                    .unpaidAmount(i.getTotalAmount())
                    .invoiceMonth(i.getInvoiceMonth())
                    .status(i.getPaymentStatus().name())
                    .build());
        }

        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .actualCashFlow(actualCashFlow)
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms)
                .occupancyRate(occupancyRate)
                .unpaidInvoiceCount(unpaidInvoices.size())
                .unpaidRooms(unpaidRoomsList)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedInvoicesResponse getInvoices(Long accountId, Long buildingId, PaymentStatus status, String month, String search, int page, int size) {
        List<Long> authorizedBuildingIds = getAuthorizedBuildingIds(accountId, buildingId);
        if (authorizedBuildingIds.isEmpty()) {
            return PaginatedInvoicesResponse.builder()
                    .content(new ArrayList<>())
                    .totalPages(0)
                    .totalElements(0)
                    .pageNumber(page)
                    .pageSize(size)
                    .build();
        }

        Specification<Invoice> spec = Specification.where(InvoiceSpecification.hasBuildingIds(authorizedBuildingIds))
                .and(InvoiceSpecification.hasPaymentStatus(status))
                .and(InvoiceSpecification.hasInvoiceMonth(month))
                .and(InvoiceSpecification.hasSearchQuery(search));

        Pageable pageable = PageRequest.of(page, size, Sort.by("invoiceId").descending());
        Page<Invoice> invoicesPage = invoiceRepository.findAll(spec, pageable);

        List<InvoiceResponse> content = invoicesPage.getContent().stream()
                .map(invoiceMapper::toResponse)
                .toList();

        return PaginatedInvoicesResponse.builder()
                .content(content)
                .totalPages(invoicesPage.getTotalPages())
                .totalElements(invoicesPage.getTotalElements())
                .pageNumber(invoicesPage.getNumber())
                .pageSize(invoicesPage.getSize())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceDetails(Long accountId, Long invoiceId) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        validateBuildingAccess(accountId, invoice.getContract().getRoom().getBuilding().getBuildingId());
        return invoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse updateInvoiceStatus(Long accountId, Long invoiceId, UpdateInvoiceStatusRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        validateBuildingAccess(accountId, invoice.getContract().getRoom().getBuilding().getBuildingId());

        if (invoice.getPaymentStatus() == PaymentStatus.VOID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update status of a voided invoice");
        }

        if (request.getPaymentStatus() != null) {
            invoice.setPaymentStatus(request.getPaymentStatus());
        }
        if (request.getPaymentMethod() != null) {
            invoice.setPaymentMethod(request.getPaymentMethod());
        }

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice {} updated status to {} manually by account {}", invoiceId, saved.getPaymentStatus(), accountId);
        return invoiceMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoicePreviewResponse> getCalculatePreview(Long accountId, Long buildingId, String month) {
        validateBuildingAccess(accountId, buildingId);

        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Building not found"));

        List<InvoicePreviewResponse> previews = new ArrayList<>();

        for (Room room : building.getRooms()) {
            Contract activeContract = room.getContracts().stream()
                    .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                    .findFirst()
                    .orElse(null);

            if (activeContract == null) {
                continue; // Only bill rooms with active contracts
            }

            // Check if active invoice already exists for this month
            Optional<Invoice> existingInvoice = invoiceRepository.findByContractContractIdAndInvoiceMonthAndPaymentStatusNot(
                    activeContract.getContractId(), month, PaymentStatus.VOID);
            if (existingInvoice.isPresent()) {
                continue; // Already invoiced for this month
            }

            // Find electricity & water details
            BigDecimal elecPrice = BigDecimal.ZERO;
            BigDecimal waterPrice = BigDecimal.ZERO;
            List<InvoicePreviewResponse.OtherFeeDto> otherFees = new ArrayList<>();

            for (ServiceFee fee : activeContract.getServiceFees()) {
                if (fee.getName().toLowerCase().contains("điện") || fee.getName().toLowerCase().contains("electric")) {
                    elecPrice = fee.getFee();
                } else if (fee.getName().toLowerCase().contains("nước") || fee.getName().toLowerCase().contains("water")) {
                    waterPrice = fee.getFee();
                } else {
                    otherFees.add(InvoicePreviewResponse.OtherFeeDto.builder()
                            .name(fee.getName())
                            .fee(fee.getFee())
                            .chargeType(fee.getChargeType().name())
                            .build());
                }
            }

            // Fetch old indexes
            Integer oldElec = getOldIndex(activeContract, "Điện", activeContract.getInitialElectricityIndex());
            Integer oldWater = getOldIndex(activeContract, "Nước", activeContract.getInitialWaterIndex());

            previews.add(InvoicePreviewResponse.builder()
                    .roomCode(room.getRoomCode())
                    .contractId(activeContract.getContractId())
                    .tenantName(invoiceMapper.getContractHolderName(activeContract))
                    .roomRent(activeContract.getRent())
                    .oldElectricityIndex(oldElec)
                    .electricityPrice(elecPrice)
                    .oldWaterIndex(oldWater)
                    .waterPrice(waterPrice)
                    .additionalFee(BigDecimal.ZERO)
                    .additionalFeeNote("")
                    .otherServiceFees(otherFees)
                    .build());
        }

        return previews;
    }

    @Override
    @Transactional
    public List<InvoiceResponse> issueInvoices(Long accountId, IssueInvoicesRequest request) {
        validateBuildingAccess(accountId, request.getBuildingId());

        if (request.getDueDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hạn chót thanh toán không được để trống");
        }
        if (request.getDueDate().isBefore(java.time.LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hạn chót thanh toán không được nhỏ hơn ngày hiện tại");
        }

        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Building not found"));

        List<InvoiceResponse> issued = new ArrayList<>();

        for (IssueInvoicesRequest.RoomCalculationInput input : request.getRooms()) {
            Contract activeContract = building.getRooms().stream()
                    .filter(r -> r.getRoomCode().equals(input.getRoomCode()))
                    .flatMap(r -> r.getContracts().stream())
                    .filter(c -> c.getContractId().equals(input.getContractId()) && c.getStatus() == ContractStatus.ACTIVE)
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Active contract not found for room " + input.getRoomCode()));

            // Check duplicate
            Optional<Invoice> existingInvoice = invoiceRepository.findByContractContractIdAndInvoiceMonthAndPaymentStatusNot(
                    activeContract.getContractId(), request.getInvoiceMonth(), PaymentStatus.VOID);
            if (existingInvoice.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room " + input.getRoomCode() + " already invoiced for month " + request.getInvoiceMonth());
            }

            Invoice invoice = Invoice.builder()
                    .invoiceMonth(request.getInvoiceMonth())
                    .paymentStatus(PaymentStatus.PENDING)
                    .contract(activeContract)
                    .details(new HashSet<>())
                    .totalAmount(BigDecimal.ZERO)
                    .issueDate(java.time.LocalDate.now())
                    .dueDate(request.getDueDate())
                    .build();

            // 1. Add Room Rent (use overridden rent if provided, else contract rent)
            BigDecimal roomRent = input.getRoomRent() != null ? input.getRoomRent() : activeContract.getRent();
            invoice.getDetails().add(InvoiceDetail.builder()
                    .itemName("Tiền phòng")
                    .chargeType(ChargeType.PER_ROOM)
                    .unitPrice(roomRent)
                    .quantity(BigDecimal.ONE)
                    .subTotal(roomRent)
                    .invoice(invoice)
                    .build());

            // 2. Process Electric and Water
            for (ServiceFee fee : activeContract.getServiceFees()) {
                if (fee.getName().toLowerCase().contains("điện") || fee.getName().toLowerCase().contains("electric")) {
                    Integer oldElec = getOldIndex(activeContract, "Điện", activeContract.getInitialElectricityIndex());
                    Integer newElec = input.getNewElectricityIndex() != null ? input.getNewElectricityIndex() : oldElec;
                    if (newElec < oldElec) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New electricity index cannot be less than old index for room " + input.getRoomCode());
                    }
                    BigDecimal qty = BigDecimal.valueOf(newElec - oldElec);
                    BigDecimal subTotal = fee.getFee().multiply(qty);

                    invoice.getDetails().add(InvoiceDetail.builder()
                            .itemName("Tiền điện (" + fee.getName() + ")")
                            .chargeType(ChargeType.PER_INDEX)
                            .unitPrice(fee.getFee())
                            .quantity(qty)
                            .oldIndex(oldElec)
                            .newIndex(newElec)
                            .subTotal(subTotal)
                            .invoice(invoice)
                            .build());
                } else if (fee.getName().toLowerCase().contains("nước") || fee.getName().toLowerCase().contains("water")) {
                    Integer oldWater = getOldIndex(activeContract, "Nước", activeContract.getInitialWaterIndex());
                    Integer newWater = input.getNewWaterIndex() != null ? input.getNewWaterIndex() : oldWater;
                    if (newWater < oldWater) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New water index cannot be less than old index for room " + input.getRoomCode());
                    }
                    BigDecimal qty = BigDecimal.valueOf(newWater - oldWater);
                    BigDecimal subTotal = fee.getFee().multiply(qty);

                    invoice.getDetails().add(InvoiceDetail.builder()
                            .itemName("Tiền nước (" + fee.getName() + ")")
                            .chargeType(ChargeType.PER_INDEX)
                            .unitPrice(fee.getFee())
                            .quantity(qty)
                            .oldIndex(oldWater)
                            .newIndex(newWater)
                            .subTotal(subTotal)
                            .invoice(invoice)
                            .build());
                } else {
                    // Fixed fees
                    invoice.getDetails().add(InvoiceDetail.builder()
                            .itemName(fee.getName())
                            .chargeType(fee.getChargeType())
                            .unitPrice(fee.getFee())
                            .quantity(BigDecimal.ONE)
                            .subTotal(fee.getFee())
                            .invoice(invoice)
                            .build());
                }
            }

            // 3. Add Additional Fee
            if (input.getAdditionalFee() != null && input.getAdditionalFee().compareTo(BigDecimal.ZERO) > 0) {
                String note = (input.getAdditionalFeeNote() != null && !input.getAdditionalFeeNote().isBlank())
                        ? input.getAdditionalFeeNote() : "Phí phát sinh khác";
                invoice.getDetails().add(InvoiceDetail.builder()
                        .itemName(note)
                        .chargeType(ChargeType.PER_ROOM)
                        .unitPrice(input.getAdditionalFee())
                        .quantity(BigDecimal.ONE)
                        .subTotal(input.getAdditionalFee())
                        .invoice(invoice)
                        .build());
            }

            // 4. Calculate total amount
            BigDecimal total = invoice.getDetails().stream()
                    .map(InvoiceDetail::getSubTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            invoice.setTotalAmount(total);

            // 5. Save invoice first to get ID, then generate PayOS payment link
            Invoice saved = invoiceRepository.save(invoice);

            try {
                String cleanRoomCode = input.getRoomCode().replaceAll("[^a-zA-Z0-9]", "");
                String cleanMonth = request.getInvoiceMonth().replaceAll("[^a-zA-Z0-9/]", "");
                String desc = "Thanh toan " + cleanRoomCode + " " + cleanMonth;
                if (desc.length() > 25) {
                    desc = desc.substring(0, 25);
                }

                String returnUrl = "http://localhost:5173/payment-success?invoiceId=" + saved.getInvoiceId();
                String cancelUrl = "http://localhost:5173/payment-cancel?invoiceId=" + saved.getInvoiceId();

                vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest payOSRequest = 
                    vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest.builder()
                        .orderCode(saved.getInvoiceId())
                        .amount(total.longValue())
                        .description(desc)
                        .returnUrl(returnUrl)
                        .cancelUrl(cancelUrl)
                        .build();

                vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse payOSResponse = 
                    payOSService.createPaymentLink(payOSRequest);

                saved.setPaymentUrlQrCode(payOSResponse.getCheckoutUrl());
            } catch (Exception e) {
                log.error("Failed to create PayOS payment link for invoice " + saved.getInvoiceId() + ", falling back to static VietQR", e);
                saved.setPaymentUrlQrCode(generateQrCodeUrl(building, total, input.getRoomCode(), request.getInvoiceMonth()));
            }

            try {
                emailService.sendInvoiceEmail(activeContract, saved);
                saved.setMailStatus(MailStatus.SENT);
            } catch (Exception e) {
                log.error("Failed to send email for invoice " + saved.getInvoiceId() + " to room " + input.getRoomCode(), e);
                saved.setMailStatus(MailStatus.FAILED);
            }

            saved = invoiceRepository.save(saved);
            issued.add(invoiceMapper.toResponse(saved));
        }

        return issued;
    }

    @Override
    @Transactional
    public InvoiceResponse voidInvoice(Long accountId, Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        validateBuildingAccess(accountId, invoice.getContract().getRoom().getBuilding().getBuildingId());

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot void a paid invoice");
        }

        invoice.setPaymentStatus(PaymentStatus.VOID);
        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice {} has been VOIDED by account {}", invoiceId, accountId);
        return invoiceMapper.toResponse(saved);
    }

    private List<Long> getAuthorizedBuildingIds(Long accountId, Long filterBuildingId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        List<Long> authorizedIds = new ArrayList<>();
        if (account.getRole() == Role.ADMIN) {
            if (filterBuildingId != null) {
                authorizedIds.add(filterBuildingId);
            } else {
                authorizedIds = buildingRepository.findAll().stream().map(Building::getBuildingId).toList();
            }
        } else if (account.getRole() == Role.LANDLORD) {
            List<Long> ownedIds = buildingRepository.findAll().stream()
                    .filter(b -> b.getLandlord() != null && b.getLandlord().getAccountId().equals(accountId))
                    .map(Building::getBuildingId).toList();
            if (filterBuildingId != null) {
                if (ownedIds.contains(filterBuildingId)) {
                    authorizedIds.add(filterBuildingId);
                } else {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to building " + filterBuildingId);
                }
            } else {
                authorizedIds.addAll(ownedIds);
            }
        } else if (account.getRole() == Role.MANAGER) {
            List<Long> managedIds = buildingRepository.findByManagerId(accountId).stream().map(Building::getBuildingId).toList();
            if (filterBuildingId != null) {
                if (managedIds.contains(filterBuildingId)) {
                    authorizedIds.add(filterBuildingId);
                } else {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to building " + filterBuildingId);
                }
            } else {
                authorizedIds.addAll(managedIds);
            }
        }
        return authorizedIds;
    }

    private void validateBuildingAccess(Long accountId, Long buildingId) {
        getAuthorizedBuildingIds(accountId, buildingId);
    }

    private Integer getOldIndex(Contract contract, String itemName, Integer contractInitialIndex) {
        List<Integer> latestIndices = invoiceRepository.findLatestNewIndexByContractAndItemName(contract.getContractId(), itemName);
        if (!latestIndices.isEmpty()) {
            return latestIndices.get(0);
        }
        return contractInitialIndex != null ? contractInitialIndex : 0;
    }

    private String generateQrCodeUrl(Building building, BigDecimal amount, String roomCode, String month) {
        String bankNameVal = defaultBank;
        String accountNumberVal = defaultAccount;
        String userNameVal = defaultName;

        if (building.getBankAccount() != null) {
            BankAccount bank = building.getBankAccount();
            bankNameVal = bank.getBankName();
            accountNumberVal = bank.getAccountNumber();
            userNameVal = bank.getUserName();
        }

        try {
            String bankName = URLEncoder.encode(bankNameVal, StandardCharsets.UTF_8);
            String desc = URLEncoder.encode("Thanh toan hoa don phong " + roomCode + " thang " + month, StandardCharsets.UTF_8);
            String userName = URLEncoder.encode(userNameVal, StandardCharsets.UTF_8);

            return String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                    bankName, accountNumberVal, amount.toPlainString(), desc, userName);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    @Transactional
    public InvoiceResponse resendInvoiceEmail(Long accountId, Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        validateBuildingAccess(accountId, invoice.getContract().getRoom().getBuilding().getBuildingId());

        if (invoice.getPaymentStatus() == PaymentStatus.VOID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot send email for a voided invoice");
        }

        Contract contract = invoice.getContract();
        try {
            emailService.sendInvoiceEmail(contract, invoice);
            invoice.setMailStatus(MailStatus.SENT);
            Invoice saved = invoiceRepository.save(invoice);
            return invoiceMapper.toResponse(saved);
        } catch (Exception e) {
            invoice.setMailStatus(MailStatus.FAILED);
            invoiceRepository.save(invoice);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Gửi email thất bại: " + e.getMessage());
        }
    }
}

