package com.apartment.management.features.building.specification;

import com.apartment.management.features.building.dto.request.BuildingFilterRequest;
import com.apartment.management.shared.entity.Building;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class BuildingSpecification {

    public static Specification<Building> getBuildingWithFilter(
            Long landlordId,
            BuildingFilterRequest filter
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.equal(
                    root.get("landlord").get("accountId"),
                    landlordId
            ));

            //filter
            if (filter != null) {
                //filter by keywork
                if (StringUtils.hasText(filter.getKeyword())) {
                    String keywordPattern = "%" + filter.getKeyword().trim().toLowerCase() + "%";

                    predicates.add(criteriaBuilder.or(
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), keywordPattern),
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("address")), keywordPattern)
                    ));
                }

                //filter by floor
                if (filter.getMinFloor() != null) {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("numberOfFloor"), filter.getMinFloor()));
                }
                if (filter.getMaxFloor() != null) {
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("numberOfFloor"), filter.getMaxFloor()));
                }

                //filter by image
                if (filter.getHasImages() != null) {
                    if (filter.getHasImages()) {
                        predicates.add(criteriaBuilder.isNotEmpty(root.get("images")));
                    } else {
                        predicates.add(criteriaBuilder.isEmpty(root.get("images")));
                    }
                }
            }
            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
