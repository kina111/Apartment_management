package com.apartment.management.features.contract.dto;

import com.apartment.management.shared.enums.ContractStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContractSearchRequest {
    private String search;
    private ContractStatus status;
}
