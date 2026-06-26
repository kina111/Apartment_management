package com.apartment.management.features.room.mapper;


import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.apartment.management.features.room.dto.RoomResponse;
import com.apartment.management.features.room.dto.RoomTypeImageResponse;
import com.apartment.management.features.room.dto.RoomTypeResponse;
import com.apartment.management.shared.entity.Room;
import com.apartment.management.shared.entity.RoomType;
import com.apartment.management.shared.entity.RoomTypeImage;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RoomMapper {

    RoomTypeImageResponse toResponse(RoomTypeImage roomTypeImage);

    RoomTypeResponse toResponse(RoomType roomType);

    RoomResponse toResponse(Room room);

}
