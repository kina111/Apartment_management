package com.apartment.management.features.notification.dto;

import lombok.Data;
import java.util.List;

@Data
public class TargetListResponse {
    private List<TargetItem> tenants;
    private List<TargetItem> managers;
}
