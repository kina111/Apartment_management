package com.apartment.management.features.billing.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginatedInvoicesResponse {
    private List<InvoiceResponse> content;
    private int totalPages;
    private long totalElements;
    private int pageNumber;
    private int pageSize;
}
