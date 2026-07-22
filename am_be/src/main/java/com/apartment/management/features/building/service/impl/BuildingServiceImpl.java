package com.apartment.management.features.building.service.impl;

import com.apartment.management.features.auth.repository.AccountRepository;
import com.apartment.management.features.building.dto.request.BuildingFilterRequest;
import com.apartment.management.features.building.dto.request.CreateBuildingRequest;
import com.apartment.management.features.building.dto.request.UpdateBuildingBankAccountRequest;
import com.apartment.management.features.building.dto.response.BuildingBankAccountResponse;
import com.apartment.management.features.building.dto.response.BuildingDetailResponse;
import com.apartment.management.features.building.dto.response.BuildingOptionResponse;
import com.apartment.management.features.building.dto.response.BuildingResponse;
import com.apartment.management.features.building.mapper.BuildingMapper;
import com.apartment.management.features.building.repository.BankAccountRepository;
import com.apartment.management.features.building.repository.BuildingRepository;
import com.apartment.management.features.building.service.BuildingService;
import com.apartment.management.features.building.specification.BuildingSpecification;
import com.apartment.management.features.contract.repository.ContractRepository;
import com.apartment.management.shared.dtos.PageResponse;
import com.apartment.management.shared.entity.Account;
import com.apartment.management.shared.entity.BankAccount;
import com.apartment.management.shared.entity.Building;
import com.apartment.management.shared.entity.BuildingImage;
import com.apartment.management.shared.enums.ContractStatus;
import com.apartment.management.shared.enums.FolderName;
import com.apartment.management.shared.exception.BusinessException;
import com.apartment.management.shared.service.CloudService;
import com.apartment.management.shared.service.CurrentUserService;
import com.apartment.management.shared.utils.FileHelper;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class BuildingServiceImpl implements BuildingService {

    private static final int MAX_BUILDING_IMAGES = 5;

    private final BuildingRepository buildingRepository;
    private final AccountRepository accountRepository;
    private final BankAccountRepository bankAccountRepository;
    private final ContractRepository contractRepository;
    private final BuildingMapper buildingMapper;
    private final CloudService cloudService;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public BuildingResponse createOrUpdateBuilding(Long buildingId, CreateBuildingRequest request, List<MultipartFile> images) {

        List<String> uploadedImageUrls = new ArrayList<>();

        try {
            Building building = buildingId == null
                    ? newBuilding(request)
                    : findOwnedBuilding(buildingId);

            applyBuildingFields(building, request);

            validateBuildingImageLimit(building, images);
            uploadImages(images, building, uploadedImageUrls);

            Building savedBuilding = buildingRepository.save(building);
            return buildingMapper.toResponse(savedBuilding);
        } catch (RuntimeException exception) {
            cleanupUploadedImages(uploadedImageUrls);
            throw exception;
        }
    }

    private Account findLandlord(Long landlordId) {
        Long targetLandlordId = landlordId != null ? landlordId : currentUserService.getCurrentUserId();

        return accountRepository.findById(targetLandlordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Landlord account not found"));
    }

    private Building newBuilding(CreateBuildingRequest request) {
        return Building.builder()
                .landlord(findLandlord(request.getLandlordId()))
                .build();
    }

    private Building findOwnedBuilding(Long buildingId) {
        Long landlordId = currentUserService.getCurrentUserId();

        return buildingRepository.findByBuildingIdAndLandlord_AccountId(buildingId, landlordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Building not found"));
    }

    private Building findAccessibleBuilding(Long buildingId) {
        Long accountId = currentUserService.getCurrentUserId();

        Building building = buildingRepository.findByBuildingId(buildingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Building not found"));

        boolean isLandlord = building.getLandlord() != null
                && building.getLandlord().getAccountId().equals(accountId);
        boolean isAssignedManager = building.getManagers().stream()
                .anyMatch(manager -> manager.getAccountId().equals(accountId));

        if (!isLandlord && !isAssignedManager) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Building not found");
        }

        return building;
    }

    private void applyBuildingFields(Building building, CreateBuildingRequest request) {
        building.setName(request.getName().trim());
        building.setAddress(request.getAddress().trim());
        building.setNumberOfFloor(request.getNumberOfFloor());
        building.setDescription(normalizeDescription(request.getDescription()));
        building.setArea(request.getArea());
        building.setNumberOfBasement(request.getNumberOfBasement());
        building.setTotalRooms(request.getTotalRooms());
        building.setYearBuilt(request.getYearBuilt());
        building.setPhoneNumber(normalizeText(request.getPhoneNumber()));
        building.setEmail(normalizeText(request.getEmail()));
    }

    private String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.trim();
    }

    private String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private void validateBuildingImageLimit(Building building, List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return;
        }

        long newImageCount = images.stream()
                .filter(image -> image != null && !image.isEmpty())
                .count();

        if (building.getImages().size() + newImageCount > MAX_BUILDING_IMAGES) {
            throw new BusinessException("Each building can have at most " + MAX_BUILDING_IMAGES + " images");
        }
    }

    private void uploadImages(List<MultipartFile> images, Building building, List<String> uploadedImageUrls) {
        if (images == null || images.isEmpty()) {
            return;
        }

        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                continue;
            }
            FileHelper.validateImage(image);

            String imageUrl = cloudService.uploadImage(image, FolderName.BUILDING);
            uploadedImageUrls.add(imageUrl);
            building.getImages().add(BuildingImage.builder()
                    .url(imageUrl)
                    .building(building)
                    .build());
        }
    }

    private void cleanupUploadedImages(List<String> uploadedImageUrls) {
        if (uploadedImageUrls.isEmpty()) {
            return;
        }

        log.warn("Cleaning up uploaded building images after save failure. uploadedImageCount={}", uploadedImageUrls.size());

        for (String imageUrl : uploadedImageUrls) {
            try {
                cloudService.deleteFile(imageUrl);
            } catch (RuntimeException exception) {
                log.warn("Failed to cleanup uploaded building image. imageUrl={}", imageUrl, exception);
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

    @Override
    @Transactional(readOnly = true)
    public BuildingDetailResponse getBuildingDetail(Long buildingId) {
        Building building = findAccessibleBuilding(buildingId);

        return buildingMapper.toDetailResponse(building);
    }

    @Override
    @Transactional(readOnly = true)
    public BuildingBankAccountResponse getBuildingBankAccount(Long buildingId) {
        Building building = findOwnedBuilding(buildingId);

        return buildingMapper.toBankAccountResponse(building.getBankAccount());
    }

    @Override
    @Transactional
    public BuildingBankAccountResponse updateBuildingBankAccount(Long buildingId, UpdateBuildingBankAccountRequest request) {
        Building building = findOwnedBuilding(buildingId);
        BankAccount bankAccount = building.getBankAccount();

        if (bankAccount == null) {
            bankAccount = new BankAccount();
        }

        bankAccount.setBankName(normalizeText(request.bankName()));
        bankAccount.setAccountNumber(normalizeText(request.accountNumber()));
        bankAccount.setUserName(normalizeText(request.userName()));

        BankAccount savedBankAccount = bankAccountRepository.save(bankAccount);
        building.setBankAccount(savedBankAccount);
        buildingRepository.save(building);

        return buildingMapper.toBankAccountResponse(savedBankAccount);
    }

    @Override
    @Transactional
    public void deleteBuilding(Long buildingId) {
        Building building = findOwnedBuilding(buildingId);

        if (contractRepository.existsByRoom_Building_BuildingIdAndStatus(buildingId, ContractStatus.ACTIVE)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể xóa tòa nhà vì vẫn còn hợp đồng đang hoạt động");
        }

        buildingRepository.delete(building);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BuildingOptionResponse> getMyBuildingOptions() {
        Long landlordId = currentUserService.getCurrentUserId();

        return buildingRepository.findAllByLandlord_AccountId(landlordId)
                .stream()
                .map(building -> new BuildingOptionResponse(
                        building.getBuildingId(),
                        building.getName(),
                        building.getAddress()
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BuildingResponse> getBuildingsByLandlordId(
            BuildingFilterRequest filter,
            Pageable pageable
    ) {
        BuildingFilterRequest effectiveFilter = filter != null ? filter : new BuildingFilterRequest();

        if (effectiveFilter.getLandlordId() == null && effectiveFilter.getManagerId() == null) {
            Long landlordId = currentUserService.getCurrentUserId();

            Account landlord = accountRepository.findById(landlordId).orElseThrow(()
                    -> new IllegalArgumentException("Landlord account not found"));
            effectiveFilter.setLandlordId(landlord.getAccountId());
        }

        //valid filter
        if (effectiveFilter.getMinFloor() != null
                && effectiveFilter.getMaxFloor() != null
                && effectiveFilter.getMinFloor() > effectiveFilter.getMaxFloor()) {
            throw new BusinessException(
                    "minFloor must be less than or equal to maxFloor"
            );
        }

        Page<BuildingResponse> buildingResponsePage = buildingRepository.findAll(
                BuildingSpecification.getBuildingWithFilter(
                        effectiveFilter
                ), pageable
        ).map(buildingMapper::toResponse);

        return PageResponse.from(buildingResponsePage);
    }
}
