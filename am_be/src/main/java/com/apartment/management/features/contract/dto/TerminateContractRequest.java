package com.apartment.management.features.contract.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class TerminateContractRequest {
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate terminationDate;
    private String assetCondition;
    private String depositStatus;
    private String reason;
}
