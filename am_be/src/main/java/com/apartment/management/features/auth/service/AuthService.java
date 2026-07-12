package com.apartment.management.features.auth.service;

import com.apartment.management.features.auth.dto.AuthResponse;
import com.apartment.management.features.auth.dto.LoginRequest;
import com.apartment.management.features.auth.dto.RefreshTokenRequest;
import com.apartment.management.features.auth.security.JwtUtils;
import com.apartment.management.features.auth.security.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.accountName(), request.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String accessToken = jwtUtils.generateAccessToken(userDetails.getUsername(), userDetails.getRole());
        String refreshToken = jwtUtils.generateRefreshToken(userDetails.getUsername(), userDetails.getRole());

        return new AuthResponse(
                accessToken,
                refreshToken,
                userDetails.getAccountId(),
                userDetails.getUsername(),
                userDetails.getRole()
        );
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();

        if (!jwtUtils.validateToken(refreshToken)) {
            throw new RuntimeException("Refresh Token is invalid or expired. Please log in again.");
        }

        String tokenType = jwtUtils.getTokenType(refreshToken);
        if (!"REFRESH".equals(tokenType)) {
            throw new RuntimeException("Token is not a Refresh Token.");
        }

        String username = jwtUtils.getUsernameFromToken(refreshToken);
        String role = jwtUtils.getRoleFromToken(refreshToken);

        String newAccessToken = jwtUtils.generateAccessToken(username, role);

        return new AuthResponse(newAccessToken, refreshToken, null, username, role);
    }
}
