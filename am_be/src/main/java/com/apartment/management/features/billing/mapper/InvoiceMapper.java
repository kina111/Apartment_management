package com.apartment.management.features.billing.mapper;

import com.apartment.management.features.billing.dto.InvoiceResponse;
import com.apartment.management.features.billing.dto.InvoiceDetailResponse;
import com.apartment.management.shared.entity.Invoice;
import com.apartment.management.shared.entity.InvoiceDetail;
import com.apartment.management.shared.entity.Contract;
import com.apartment.management.shared.mapper.MapStructConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapStructConfig.class)
public interface InvoiceMapper {

    @Mapping(target = "contractId", source = "contract.contractId")
    @Mapping(target = "roomCode", source = "contract.room.roomCode")
    @Mapping(target = "buildingName", source = "contract.room.building.name")
    @Mapping(target = "tenantName", source = "contract")
    InvoiceResponse toResponse(Invoice invoice);

    InvoiceDetailResponse toDetailResponse(InvoiceDetail detail);

    default String getContractHolderName(Contract contract) {
        if (contract == null || contract.getContractTenants() == null) {
            return "N/A";
        }
        return contract.getContractTenants().stream()
                .filter(ct -> Boolean.TRUE.equals(ct.getIsContractHolder()))
                .map(ct -> ct.getTenant() != null ? ct.getTenant().getName() : "N/A")
                .findFirst()
                .orElse("N/A");
    }
}
