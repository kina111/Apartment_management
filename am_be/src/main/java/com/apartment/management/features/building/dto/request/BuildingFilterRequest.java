package com.apartment.management.features.building.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BuildingFilterRequest {
    @Size(
            max = 200,
            message = "Keyword must not exceed 200 characters"
    )
    private String keyword;

    private Long landlordId;

    private Long managerId;

    @Min(
            value = 1,
            message = "minFloor must be greater than 0"
    )
    @Max(
            value = 500,
            message = "minFloor must not exceed 500"
    )
    private Integer minFloor;

    @Min(
            value = 1,
            message = "maxFloor must be greater than 0"
    )
    @Max(
            value = 500,
            message = "maxFloor must not exceed 500"
    )
    private Integer maxFloor;

    private Boolean hasImages;
}
