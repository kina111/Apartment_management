package com.apartment.management.shared.service;

import com.apartment.management.features.auth.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class CurrentUserService {

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            throw new AuthenticationCredentialsNotFoundException("Authenticated user not found");
        }

        Long userId = userDetails.getAccountId();
        log.info("Current user id is {}", userId);
        return userId;
    }
}
