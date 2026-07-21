package com.apartment.management.features.contract.specification;

import com.apartment.management.shared.entity.Contract;
import com.apartment.management.shared.entity.ContractTenant;
import com.apartment.management.shared.entity.Room;
import com.apartment.management.shared.entity.Tenant;
import com.apartment.management.shared.enums.ContractStatus;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ContractSpecification {

    public static Specification<Contract> filterContracts(String search, ContractStatus status) {
        return (Root<Contract> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchLower = "%" + search.trim().toLowerCase() + "%";
                
                List<Predicate> searchPredicates = new ArrayList<>();
                
                // Match Room code
                Join<Contract, Room> roomJoin = root.join("room", JoinType.LEFT);
                searchPredicates.add(cb.like(cb.lower(roomJoin.get("roomCode")), searchLower));
                
                // Match Contract ID
                try {
                    Long id = Long.parseLong(search.trim());
                    searchPredicates.add(cb.equal(root.get("contractId"), id));
                } catch (NumberFormatException e) {
                    // Ignore, not a number
                }
                
                // Match Tenant (contract holder) name
                Join<Contract, ContractTenant> ctJoin = root.join("contractTenants", JoinType.LEFT);
                Join<ContractTenant, Tenant> tenantJoin = ctJoin.join("tenant", JoinType.LEFT);
                
                Predicate isHolder = cb.equal(ctJoin.get("isContractHolder"), true);
                Predicate tenantNameLike = cb.like(cb.lower(tenantJoin.get("name")), searchLower);
                searchPredicates.add(cb.and(isHolder, tenantNameLike));

                predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
            }

            if (query.getResultType() != Long.class) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
