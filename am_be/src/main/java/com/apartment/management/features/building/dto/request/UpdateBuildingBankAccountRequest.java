package com.apartment.management.features.building.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateBuildingBankAccountRequest(
        @NotBlank(message = "Bank name must be not blank")
        @Size(max = 255, message = "Bank name must not exceed 255 characters")
        String bankName,

        @NotBlank(message = "Account number must be not blank")
        @Size(min = 6, max = 30, message = "Account number must be between 6 and 30 characters")
        @Pattern(regexp = "^[0-9]+$", message = "Account number must contain digits only")
        String accountNumber,

        @NotBlank(message = "User name must be not blank")
        @Size(max = 255, message = "User name must not exceed 255 characters")
        String userName
) {
}
