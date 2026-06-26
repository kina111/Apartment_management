package com.apartment.management.features.contract.dto;

import com.apartment.management.shared.enums.ImageType;

public record ContractImageResponse(
    Long imageId,
    String imageUrl,
    ImageType imageType
) {

}
