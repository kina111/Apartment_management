package com.apartment.management.features.building.controller;

import com.apartment.management.features.building.dto.request.CreateBuildingRequest;
import com.apartment.management.features.building.dto.response.BuildingResponse;
import com.apartment.management.features.building.service.BuildingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/buildings")
@RequiredArgsConstructor
@Tag(name = "Buildings", description = "Building management APIs")
@CrossOrigin(origins={"http://localhost:5173", "http://localhost:5174"})
public class BuildingController {

    private final BuildingService buildingService;

    @Operation(summary = "Create building", description = "Create building information with optional images")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BuildingResponse> createBuilding(
            @ModelAttribute CreateBuildingRequest request,
            @Parameter(
                    description = "Optional building images",
                    content = @Content(array = @ArraySchema(schema = @Schema(type = "string", format = "binary")))
            )
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(buildingService.createBuilding(request, images));
    }

    @GetMapping()
    public ResponseEntity<List<BuildingResponse>> getBuildingsByManagerId(@RequestParam("managerId") Long managerId) {
        return ResponseEntity.status(HttpStatus.OK).body(buildingService.getBuildingByManagerId(managerId));
    }
}
