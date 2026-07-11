package com.apartment.management.features.billing.repository;

import com.apartment.management.shared.entity.Invoice;
import com.apartment.management.shared.enums.PaymentStatus;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class InvoiceSpecification {

    public static Specification<Invoice> hasBuildingId(Long buildingId) {
        return (root, query, criteriaBuilder) -> {
            if (buildingId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Object, Object> contractJoin = root.join("contract");
            Join<Object, Object> roomJoin = contractJoin.join("room");
            Join<Object, Object> buildingJoin = roomJoin.join("building");
            return criteriaBuilder.equal(buildingJoin.get("buildingId"), buildingId);
        };
    }

    public static Specification<Invoice> hasBuildingIds(List<Long> buildingIds) {
        return (root, query, criteriaBuilder) -> {
            if (buildingIds == null || buildingIds.isEmpty()) {
                return criteriaBuilder.disjunction(); // Disjunction returns empty if no buildings authorized
            }
            Join<Object, Object> contractJoin = root.join("contract");
            Join<Object, Object> roomJoin = contractJoin.join("room");
            Join<Object, Object> buildingJoin = roomJoin.join("building");
            return buildingJoin.get("buildingId").in(buildingIds);
        };
    }

    public static Specification<Invoice> hasPaymentStatus(PaymentStatus paymentStatus) {
        return (root, query, criteriaBuilder) -> {
            if (paymentStatus == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("paymentStatus"), paymentStatus);
        };
    }

    public static Specification<Invoice> hasInvoiceMonth(String invoiceMonth) {
        return (root, query, criteriaBuilder) -> {
            if (invoiceMonth == null || invoiceMonth.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("invoiceMonth"), invoiceMonth);
        };
    }

    public static Specification<Invoice> hasSearchQuery(String searchQuery) {
        return (root, query, criteriaBuilder) -> {
            if (searchQuery == null || searchQuery.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            String searchPattern = "%" + searchQuery.trim().toLowerCase() + "%";
            
            Join<Object, Object> contractJoin = root.join("contract");
            Join<Object, Object> roomJoin = contractJoin.join("room");
            
            Join<Object, Object> contractTenantsJoin = contractJoin.join("contractTenants");
            Join<Object, Object> tenantJoin = contractTenantsJoin.join("tenant");
            
            if (query != null) {
                query.distinct(true);
            }
            
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(roomJoin.get("roomCode")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(tenantJoin.get("name")), searchPattern)
            );
        };
    }
}
