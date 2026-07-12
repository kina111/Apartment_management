package com.apartment.management.features.auth.controller;

import com.apartment.management.features.auth.dto.AuthResponse;
import com.apartment.management.features.auth.dto.LoginRequest;
import com.apartment.management.features.auth.dto.RefreshTokenRequest;
import com.apartment.management.features.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Login and Token Refresh APIs")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Login with accountName and password")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Get new Access Token using Refresh Token")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user (client should clear tokens)")
    public ResponseEntity<String> logout() {
        // Since we are using stateless JWT, the server doesn't need to invalidate the token in DB.
        // The client simply deletes the tokens from LocalStorage.
        return ResponseEntity.ok("Logged out successfully");
    }


}
