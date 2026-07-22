package com.apartment.management.features.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        Long accountId,
        String accountName,
        String role
) {
}
