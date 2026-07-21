package com.apartment.management.shared.service;

import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    public Long getCurrentUserId() {
        //TODO extract userId from SecurityContextHolder
        return 1L;
    }
}
