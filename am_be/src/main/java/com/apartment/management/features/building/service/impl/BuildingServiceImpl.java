package com.apartment.management.features.building.service.impl;

import com.apartment.management.features.building.dto.request.CreateBuildingRequest;
import com.apartment.management.features.building.dto.response.BuildingResponse;
import com.apartment.management.features.building.mapper.BuildingMapper;
import com.apartment.management.features.building.repository.AccountRepository;
import com.apartment.management.features.building.repository.BuildingRepository;
import com.apartment.management.features.building.service.BuildingService;
import com.apartment.management.shared.entity.Account;
import com.apartment.management.shared.entity.Building;
import com.apartment.management.shared.entity.BuildingImage;
import com.apartment.management.shared.enums.FolderName;
import com.apartment.management.shared.service.CloudService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BuildingServiceImpl implements BuildingService {

    private final BuildingRepository buildingRepository;
    private final AccountRepository accountRepository;
    private final BuildingMapper buildingMapper;
    private final CloudService cloudService;

    @Override
    @Transactional
    public BuildingResponse createBuilding(CreateBuildingRequest request, List<MultipartFile> images) {
        validateRequest(request);

        List<String> uploadedImageUrls = new ArrayList<>();
        try {
            Account landlord = findLandlord(request.getLandlordId());
            Building building = Building.builder()
                    .name(request.getName().trim())
                    .address(request.getAddress().trim())
                    .numberOfFloor(request.getNumberOfFloor())
                    .description(normalizeDescription(request.getDescription()))
                    .landlord(landlord)
                    .build();

            uploadImages(images, building, uploadedImageUrls);

            Building savedBuilding = buildingRepository.save(building);
            return buildingMapper.toResponse(savedBuilding);
        } catch (RuntimeException exception) {
            cleanupUploadedImages(uploadedImageUrls);
            throw exception;
        }
    }

    private void validateRequest(CreateBuildingRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Building request is required");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Building name is required");
        }
        if (request.getAddress() == null || request.getAddress().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Building address is required");
        }
        if (request.getNumberOfFloor() == null || request.getNumberOfFloor() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Number of floor must be greater than 0");
        }
    }

    private Account findLandlord(Long landlordId) {
        if (landlordId == null) {
            return null;
        }
        return accountRepository.findById(landlordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Landlord account not found"));
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.trim();
    }

    private void uploadImages(List<MultipartFile> images, Building building, List<String> uploadedImageUrls) {
        if (images == null || images.isEmpty()) {
            return;
        }

        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                continue;
            }

            String imageUrl = cloudService.uploadImage(image, FolderName.BUILDING);
            uploadedImageUrls.add(imageUrl);
            building.getImages().add(BuildingImage.builder()
                    .url(imageUrl)
                    .building(building)
                    .build());
        }
    }

    private void cleanupUploadedImages(List<String> uploadedImageUrls) {
        for (String imageUrl : uploadedImageUrls) {
            try {
                cloudService.deleteFile(imageUrl);
            } catch (RuntimeException ignored) {
            }
        }
    }

    @Override
    public List<BuildingResponse> getBuildingByManagerId(Long managerId) {
        return buildingRepository.findByManagerId(managerId)
                .stream()
                .map(buildingMapper::toResponse)
                .toList();
    }
}
