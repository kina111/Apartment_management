package com.apartment.management.features.building.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBuildingRequest {
    @NotNull(message = "Name must be not blank")
    private String name;

    @NotNull(message = "Address must be not blank")
    private String address;

    @Min(value = 1,message = "Number of floor must be greater than 0")
    private Integer numberOfFloor;

    private String description;

    private Long landlordId;
}
