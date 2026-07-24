package com.apartment.management.features.building.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBuildingRequest {
    @NotBlank(message = "Name must be not blank")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @NotBlank(message = "Address must be not blank")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @NotNull(message = "Number of floor must be not null")
    @Min(value = 1,message = "Number of floor must be greater than 0")
    @Max(value = 50, message = "Number of floor must not exceed 50")
    private Integer numberOfFloor;
}
