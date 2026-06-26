package com.apartment.management.features.contract.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.factory.Mappers;

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

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ContractMapper {
    ContractMapper INSTANCE = Mappers.getMapper(ContractMapper.class);

    @Mapping(target = "parentContractId", source = "parentContract.contractId")
    @Mapping(target = "renewalContractIds", source = "renewalContracts")
    @Mapping(target = "contractTenantIds", source = "contractTenants")
    ContractResponse toContractResponse(Contract contract);

    ServiceFeeResponse toServiceFeeResponse(ServiceFee serviceFee);

    ContractImageResponse toContractImageResponse(ContractImage contractImage);

    @Mapping(target = "detailIds", source = "details")
    InvoiceResponse toInvoiceResponse(Invoice invoice);

    InvoiceDetailResponse toInvoiceDetailResponse(InvoiceDetail invoiceDetail);

    @Mapping(target = "tenantId", source = "tenant.tenantId")
    @Mapping(target = "contractId", source = "contract.contractId")
    ContractTenantResponse toContractTenantResponse(ContractTenant contractTenant);

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
}
