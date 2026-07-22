package com.apartment.management.features.building.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
    @Max(value = 50, message = "Number of floor must not exceed 50")
    private Integer numberOfFloor;

    private String description;

    @Positive(message = "Area must be greater than 0")
    private Double area;

    @Min(value = 0, message = "Number of basement must be greater than or equal to 0")
    private Integer numberOfBasement;

    @Min(value = 0, message = "Total rooms must be greater than or equal to 0")
    private Integer totalRooms;

    @Min(value = 1800, message = "Year built is invalid")
    private Integer yearBuilt;

    private String phoneNumber;

    @Email(message = "Email is invalid")
    private String email;

    private Long landlordId;
}
