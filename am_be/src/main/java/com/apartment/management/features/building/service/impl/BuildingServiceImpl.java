package com.apartment.management.features.building.service.impl;

import com.apartment.management.features.auth.repository.AccountRepository;
import com.apartment.management.features.building.dto.request.BuildingFilterRequest;
import com.apartment.management.features.building.dto.request.CreateBuildingRequest;
import com.apartment.management.features.building.dto.response.BuildingResponse;
import com.apartment.management.features.building.mapper.BuildingMapper;
import com.apartment.management.features.building.repository.BuildingRepository;
import com.apartment.management.features.building.service.BuildingService;
import com.apartment.management.features.building.specification.BuildingSpecification;
import com.apartment.management.shared.dtos.PageResponse;
import com.apartment.management.shared.entity.Account;
import com.apartment.management.shared.entity.Building;
import com.apartment.management.shared.entity.BuildingImage;
import com.apartment.management.shared.enums.FolderName;
import com.apartment.management.shared.exception.BusinessException;
import com.apartment.management.shared.service.CloudService;
import com.apartment.management.shared.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

import com.apartment.management.shared.enums.Role;

@Service
@RequiredArgsConstructor
@Slf4j
public class BuildingServiceImpl implements BuildingService {

    private final BuildingRepository buildingRepository;
    private final AccountRepository accountRepository;
    private final BuildingMapper buildingMapper;
    private final CloudService cloudService;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public BuildingResponse createBuilding(CreateBuildingRequest request, List<MultipartFile> images) {
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
    public List<BuildingResponse> getBuildingByManagerId(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        List<Building> buildings;
        if (account.getRole() == Role.LANDLORD) {
            buildings = buildingRepository.findAllByLandlord_AccountId(accountId);
        } else if (account.getRole() == Role.ADMIN) {
            buildings = buildingRepository.findAll();
        } else {
            buildings = buildingRepository.findByManagerId(accountId);
        }

        return buildings.stream()
                .map(buildingMapper::toResponse)
                .toList();
    }

    public PageResponse<BuildingResponse> getBuildingsByLandlordId(
            BuildingFilterRequest filter,
            Pageable pageable
    ) {
        Long landlordId = currentUserService.getCurrentUserId();

        Account landlord = accountRepository.findById(landlordId).orElseThrow(()
                -> new IllegalArgumentException("Landlord account not found"));

        //valid filter
        if (filter != null
                && filter.getMinFloor() != null
                && filter.getMaxFloor() != null
                && filter.getMinFloor() > filter.getMaxFloor()) {
            throw new BusinessException(
                    "minFloor must be less than or equal to maxFloor"
            );
        }

        Page<BuildingResponse> buildingResponsePage = buildingRepository.findAll(
                BuildingSpecification.getBuildingWithFilter(
                        landlordId, filter
                ), pageable
        ).map(buildingMapper::toResponse);

        return PageResponse.from(buildingResponsePage);
    }

}
