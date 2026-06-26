package com.apartment.management.features.room.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.apartment.management.features.room.dto.RoomResponse;
import com.apartment.management.features.room.mapper.RoomMapper;
import com.apartment.management.features.room.repository.RoomRepository;
import com.apartment.management.shared.entity.Room;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoomService implements IRoomService {

    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;

    @Override
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAllWithDetails().stream().map(roomMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public RoomResponse getRoomById(String roomCode) {
        Room room = roomRepository.findById(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        return roomMapper.toResponse(room);
    }

    @Override
    public List<RoomResponse> getRoomsByBuildingId(Long buildingId) {
        return roomRepository.findByBuildingId(buildingId).stream().map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

}
