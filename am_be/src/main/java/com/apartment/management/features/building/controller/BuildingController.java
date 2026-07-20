package com.apartment.management.features.building.controller;

import com.apartment.management.features.building.dto.request.BuildingFilterRequest;
import com.apartment.management.features.building.dto.request.CreateBuildingRequest;
import com.apartment.management.features.building.dto.response.BuildingDetailResponse;
import com.apartment.management.features.building.dto.response.BuildingResponse;
import com.apartment.management.features.building.service.BuildingService;
import com.apartment.management.shared.dtos.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@RestController
@RequestMapping("/buildings")
@RequiredArgsConstructor
@Tag(name = "Buildings", description = "Building management APIs")
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class BuildingController {

    private final BuildingService buildingService;

    @Operation(summary = "Create building", description = "Create building information with optional images")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BuildingResponse> createBuilding(
            @Valid @ModelAttribute CreateBuildingRequest request,
            @Parameter(
                    description = "Optional building images",
                    content = @Content(array = @ArraySchema(schema = @Schema(type = "string", format = "binary")))
            )
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {

        return ResponseEntity.status(HttpStatus.CREATED).body(buildingService.createBuilding(request, images));
    }

    @GetMapping()
    public ResponseEntity<List<BuildingResponse>> getBuildingsByManagerId(@RequestParam(value = "managerId", required = false) Long managerId) {
        if (managerId != null) {
            return ResponseEntity.status(HttpStatus.OK).body(buildingService.getBuildingByManagerId(managerId));
        }
        // Fallback or handle differently, for now just empty list if managerId is not provided
        return ResponseEntity.status(HttpStatus.OK).body(List.of());
    }

    @Operation(summary = "Get building detail", description = "Get a building owned by the authenticated landlord")
    @GetMapping("/{buildingId}")
    public ResponseEntity<BuildingDetailResponse> getBuildingDetail(@PathVariable Long buildingId) {
        return ResponseEntity.ok(buildingService.getBuildingDetail(buildingId));
    }

    @GetMapping("/my")
    public ResponseEntity<PageResponse<BuildingResponse>> getMyBuildings(
            @Valid @ModelAttribute BuildingFilterRequest filter,
            Pageable pageable) {
        return ResponseEntity.ok(
                buildingService.getBuildingsByLandlordId(
                        filter,
                        pageable
                )
        );
    }

}
