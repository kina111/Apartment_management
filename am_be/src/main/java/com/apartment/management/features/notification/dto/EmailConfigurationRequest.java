package com.apartment.management.features.notification.dto;

import lombok.Data;

@Data
public class EmailConfigurationRequest {
    private String senderEmail;
    private String senderPassword;
}
