package com.apartment.management.features.building.mapper;

import com.apartment.management.features.building.dto.response.BuildingBankAccountResponse;
import com.apartment.management.features.building.dto.response.BuildingDetailResponse;
import com.apartment.management.features.building.dto.response.BuildingResponse;
import com.apartment.management.shared.entity.BankAccount;
import com.apartment.management.shared.entity.Building;
import com.apartment.management.shared.entity.BuildingImage;
import com.apartment.management.shared.mapper.MapStructConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Mapper(config = MapStructConfig.class)
public interface BuildingMapper {

    @Mapping(target = "landlordId", source = "landlord.accountId")
    @Mapping(target = "landlordName", source = "landlord.accountName")
    @Mapping(target = "imageUrls", source = "images")
    BuildingResponse toResponse(Building building);

    @Mapping(target = "imageUrls", source = "images")
    BuildingDetailResponse toDetailResponse(Building building);

    BuildingBankAccountResponse toBankAccountResponse(BankAccount bankAccount);

    default List<String> mapImageUrls(Set<BuildingImage> images) {
        if (images == null || images.isEmpty()) {
            return Collections.emptyList();
        }
        return images.stream()
                .map(BuildingImage::getUrl)
                .toList();
    }
}
