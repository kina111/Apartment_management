package com.apartment.management.features.contract.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class CreateContractRequest {
    private String roomCode;
    private Long tenantId; // null if creating a new tenant
    
    private String tenantName;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate tenantDateOfBirth;
    private String tenantPhoneNumber;
    private String tenantPermanentAddress;
    private String tenantCitizenId;
    private String tenantEmail;
    
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;
    
    private BigDecimal rent;
    private BigDecimal depositAmount;
    private java.util.List<ServiceFeeRequest> serviceFees;
}
