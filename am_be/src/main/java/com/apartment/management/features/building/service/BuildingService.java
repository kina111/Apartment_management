package com.apartment.management.features.building.service;

import com.apartment.management.features.building.dto.request.CreateBuildingRequest;
import com.apartment.management.features.building.dto.response.BuildingResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BuildingService {
    BuildingResponse createBuilding(CreateBuildingRequest request, List<MultipartFile> images);
    List<BuildingResponse> getBuildingByManagerId(Long managerId);
    List<BuildingResponse> getBuildingsByLandlordId(Long landlordId);
}
