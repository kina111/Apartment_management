package com.apartment.management.features.building.service;

import com.apartment.management.features.building.dto.request.BuildingFilterRequest;
import com.apartment.management.features.building.dto.request.CreateBuildingRequest;
import com.apartment.management.features.building.dto.response.BuildingDetailResponse;
import com.apartment.management.features.building.dto.response.BuildingResponse;
import com.apartment.management.shared.dtos.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BuildingService {
    BuildingResponse createBuilding(CreateBuildingRequest request, List<MultipartFile> images);

    List<BuildingResponse> getBuildingByManagerId(Long managerId);

    BuildingDetailResponse getBuildingDetail(Long buildingId);

    PageResponse<BuildingResponse> getBuildingsByLandlordId(
            BuildingFilterRequest filter,
            Pageable pageable
    );
}
