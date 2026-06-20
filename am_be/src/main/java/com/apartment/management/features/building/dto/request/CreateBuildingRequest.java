package com.apartment.management.features.building.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBuildingRequest {
    private String name;
    private String address;
    private Integer numberOfFloor;
    private String description;
    private Long landlordId;
}
