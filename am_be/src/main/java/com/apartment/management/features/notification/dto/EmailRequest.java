package com.apartment.management.features.notification.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
public class EmailRequest {
    private TargetScope targetScope;
    private List<Long> specificTenantIds; // For specific tenants
    private List<Long> specificManagerIds; // For specific managers
    private Long buildingId; // Required scope
    private String subject;
    private String content;
    private List<MultipartFile> attachments;
}
