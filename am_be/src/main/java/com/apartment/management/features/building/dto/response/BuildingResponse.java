package com.apartment.management.features.building.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BuildingResponse {
    private Long buildingId;
    private String name;
    private String address;
    private Integer numberOfFloor;
    private String description;
    private Double area;
    private Integer numberOfBasement;
    private Integer totalRooms;
    private Integer yearBuilt;
    private String phoneNumber;
    private String email;
    private Long landlordId;
    private String landlordName;
    private List<String> imageUrls;
}
