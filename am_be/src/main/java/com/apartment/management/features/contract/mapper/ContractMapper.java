package com.apartment.management.features.contract.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.apartment.management.features.contract.dto.ContractImageResponse;
import com.apartment.management.features.contract.dto.ContractResponse;
import com.apartment.management.features.contract.dto.ContractTenantResponse;
import com.apartment.management.features.contract.dto.InvoiceDetailResponse;
import com.apartment.management.features.contract.dto.InvoiceResponse;
import com.apartment.management.features.contract.dto.ServiceFeeResponse;
import com.apartment.management.shared.entity.Contract;
import com.apartment.management.shared.entity.ContractImage;
import com.apartment.management.shared.entity.ContractTenant;
import com.apartment.management.shared.entity.Invoice;
import com.apartment.management.shared.entity.InvoiceDetail;
import com.apartment.management.shared.entity.ServiceFee;
import com.apartment.management.shared.mapper.MapStructConfig;

@Mapper(config = MapStructConfig.class, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ContractMapper {

    @Mapping(target = "parentContractId", source = "parentContract.contractId")
    @Mapping(target = "renewalContractIds", source = "renewalContracts", qualifiedByName = "mapRenewalContractToLong")
    @Mapping(target = "contractTenantIds", source = "contractTenants")
    @Mapping(target = "roomCode", source = "room.roomCode")
    @Mapping(target = "floorNumber", source = "room.floorNumber")
    @Mapping(target = "buildingName", source = "room.building.name")
    @Mapping(target = "tenantId", expression = "java(ContractMapper.getContractHolderId(contract))")
    @Mapping(target = "tenantName", expression = "java(ContractMapper.getContractHolderName(contract))")
    @Mapping(target = "tenantPhoneNumber", expression = "java(ContractMapper.getContractHolderPhone(contract))")
    @Mapping(target = "tenantEmail", expression = "java(ContractMapper.getContractHolderEmail(contract))")
    ContractResponse toContractResponse(Contract contract);

    @Mapping(target = "imageUrl", source = "imageUrl")
    @Mapping(target = "imageType", source = "imageType")
    ContractImageResponse toContractImageResponse(ContractImage contractImage);

    ServiceFeeResponse toServiceFeeResponse(ServiceFee serviceFee);

    @Mapping(target = "detailIds", source = "details")
    InvoiceResponse toInvoiceResponse(Invoice invoice);

    InvoiceDetailResponse toInvoiceDetailResponse(InvoiceDetail invoiceDetail);

    @Mapping(target = "tenantId", source = "tenant.tenantId")
    @Mapping(target = "contractId", source = "contract.contractId")
    ContractTenantResponse toContractTenantResponse(ContractTenant contractTenant);

    @Named("mapRenewalContractToLong")
    default Long mapRenewalContractToLong(Contract contract) {
        if (contract == null) {
            return null;
        }
        return contract.getContractId();
    }

    default Long mapContractTenantToLong(ContractTenant contractTenant) {
        if (contractTenant == null) {
            return null;
        }
        return contractTenant.getContractTenantId();
    }

    default Long mapInvoiceDetailToLong(InvoiceDetail invoiceDetail) {
        if (invoiceDetail == null) {
            return null;
        }
        return invoiceDetail.getInvoiceDetailId();
    }

    static Long getContractHolderId(Contract contract) {
        if (contract == null || contract.getContractTenants() == null) return null;
        return contract.getContractTenants().stream()
                .filter(ct -> ct.getIsContractHolder() != null && ct.getIsContractHolder())
                .map(ct -> ct.getTenant().getTenantId())
                .findFirst()
                .orElse(null);
    }
    
    static String getContractHolderName(Contract contract) {
        if (contract == null || contract.getContractTenants() == null) return null;
        return contract.getContractTenants().stream()
                .filter(ct -> ct.getIsContractHolder() != null && ct.getIsContractHolder())
                .map(ct -> ct.getTenant().getName())
                .findFirst()
                .orElse(null);
    }

    static String getContractHolderPhone(Contract contract) {
        if (contract == null || contract.getContractTenants() == null) return null;
        return contract.getContractTenants().stream()
                .filter(ct -> ct.getIsContractHolder() != null && ct.getIsContractHolder())
                .map(ct -> ct.getTenant().getPhoneNumber())
                .findFirst()
                .orElse(null);
    }

    static String getContractHolderEmail(Contract contract) {
        if (contract == null || contract.getContractTenants() == null) return null;
        return contract.getContractTenants().stream()
                .filter(ct -> ct.getIsContractHolder() != null && ct.getIsContractHolder())
                .map(ct -> ct.getTenant().getEmail())
                .findFirst()
                .orElse(null);
    }
}
