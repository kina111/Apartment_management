package com.apartment.management.features.room.service;

import java.util.List;
import java.util.stream.Collectors;

import com.apartment.management.features.building.repository.BuildingRepository;
import com.apartment.management.features.room.dto.CreateRoomTypeRequest;
import com.apartment.management.features.room.dto.QuickCreateRoomRequest;
import com.apartment.management.features.room.dto.RoomTypeResponse;
import com.apartment.management.features.room.repository.RoomTypeRepository;
import com.apartment.management.shared.entity.Building;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.apartment.management.features.room.dto.RoomResponse;
import com.apartment.management.features.room.mapper.RoomMapper;
import com.apartment.management.features.room.repository.RoomRepository;
import com.apartment.management.shared.entity.Room;
import com.apartment.management.shared.entity.RoomType;
import com.apartment.management.shared.enums.RoomStatus;
import com.apartment.management.shared.service.CurrentUserService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class RoomService implements IRoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final BuildingRepository buildingRepository;
    private final RoomMapper roomMapper;
    private final CurrentUserService currentUserService;

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

    @Override
    @Transactional(readOnly = true)
    public List<RoomTypeResponse> getRoomTypes() {
        return roomTypeRepository.findAll().stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoomTypeResponse createRoomType(CreateRoomTypeRequest request) {
        RoomType roomType = RoomType.builder().build();
        applyRoomTypeFields(roomType, request);

        return roomMapper.toResponse(roomTypeRepository.save(roomType));
    }

    @Override
    @Transactional
    public RoomTypeResponse updateRoomType(Long roomTypeId, CreateRoomTypeRequest request) {
        RoomType roomType = findRoomType(roomTypeId);
        applyRoomTypeFields(roomType, request);

        return roomMapper.toResponse(roomTypeRepository.save(roomType));
    }

    @Override
    @Transactional
    public void deleteRoomType(Long roomTypeId) {
        RoomType roomType = findRoomType(roomTypeId);

        if (roomRepository.existsByRoomType_RoomTypeId(roomTypeId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room type is already used by rooms");
        }

        roomTypeRepository.delete(roomType);
    }

    @Override
    @Transactional
    public RoomResponse quickCreateRoom(Long buildingId, QuickCreateRoomRequest request) {
        Building building = findOwnedBuilding(buildingId);
        RoomType roomType = findRoomType(request.roomTypeId());
        String roomCode = request.roomCode().trim();

        if (request.floorNumber() > building.getNumberOfFloor()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Floor number exceeds building floor count");
        }

        if (roomRepository.existsById(roomCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room code already exists");
        }

        Room room = Room.builder()
                .roomCode(roomCode)
                .floorNumber(request.floorNumber())
                .status(RoomStatus.AVAILABLE)
                .building(building)
                .roomType(roomType)
                .build();

        return roomMapper.toResponse(roomRepository.save(room));
    }

    private Building findOwnedBuilding(Long buildingId) {
        Long landlordId = currentUserService.getCurrentUserId();

        return buildingRepository.findByBuildingIdAndLandlord_AccountId(buildingId, landlordId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Building not found"));
    }

    private RoomType findRoomType(Long roomTypeId) {
        return roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room type not found"));
    }

    private void applyRoomTypeFields(RoomType roomType, CreateRoomTypeRequest request) {
        roomType.setName(request.name().trim());
        roomType.setCapacity(request.capacity());
        roomType.setArea(request.area());
        roomType.setDescription(normalizeText(request.description()));
    }

    private String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

}
