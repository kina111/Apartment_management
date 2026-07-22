package com.apartment.management.features.room.service;

import java.util.List;

import com.apartment.management.features.room.dto.CreateRoomTypeRequest;
import com.apartment.management.features.room.dto.QuickCreateRoomRequest;
import com.apartment.management.features.room.dto.RoomResponse;
import com.apartment.management.features.room.dto.RoomTypeResponse;

public interface IRoomService {
    List<RoomResponse> getAllRooms();
    RoomResponse getRoomById(String roomCode);
    List<RoomResponse> getRoomsByBuildingId(Long buildingId);
    List<RoomTypeResponse> getRoomTypes();
    RoomTypeResponse createRoomType(CreateRoomTypeRequest request);
    RoomTypeResponse updateRoomType(Long roomTypeId, CreateRoomTypeRequest request);
    void deleteRoomType(Long roomTypeId);
    RoomResponse quickCreateRoom(Long buildingId, QuickCreateRoomRequest request);
}
