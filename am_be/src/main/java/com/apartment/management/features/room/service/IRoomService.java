package com.apartment.management.features.room.service;

import java.util.List;

import com.apartment.management.features.room.dto.RoomResponse;

public interface IRoomService {
    List<RoomResponse> getAllRooms();
    RoomResponse getRoomById(String roomCode);
    List<RoomResponse> getRoomsByBuildingId(Long buildingId);
}
