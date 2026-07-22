package com.apartment.management.features.room.controller;

import com.apartment.management.features.room.dto.CreateRoomTypeRequest;
import com.apartment.management.features.room.dto.QuickCreateRoomRequest;
import com.apartment.management.features.room.dto.RoomResponse;
import com.apartment.management.features.room.dto.RoomTypeResponse;
import com.apartment.management.features.room.service.IRoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {
    private final IRoomService roomService;

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        List<RoomResponse> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/buildings/{buildingId}/rooms")
    public ResponseEntity<List<RoomResponse>> getRoomsByBuildingId(@PathVariable("buildingId") Long buildingId) {
        List<RoomResponse> rooms = roomService.getRoomsByBuildingId(buildingId);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/room-types")
    public ResponseEntity<List<RoomTypeResponse>> getRoomTypes() {
        return ResponseEntity.ok(roomService.getRoomTypes());
    }

    @PostMapping("/room-types")
    @PreAuthorize("hasAnyRole('LANDLORD')")
    public ResponseEntity<RoomTypeResponse> createRoomType(@Valid @RequestBody CreateRoomTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoomType(request));
    }

    @PutMapping("/room-types/{roomTypeId}")
    @PreAuthorize("hasAnyRole('LANDLORD')")
    public ResponseEntity<RoomTypeResponse> updateRoomType(
            @PathVariable Long roomTypeId,
            @Valid @RequestBody CreateRoomTypeRequest request) {
        return ResponseEntity.ok(roomService.updateRoomType(roomTypeId, request));
    }

    @DeleteMapping("/room-types/{roomTypeId}")
    @PreAuthorize("hasAnyRole('LANDLORD')")
    public ResponseEntity<Void> deleteRoomType(@PathVariable Long roomTypeId) {
        roomService.deleteRoomType(roomTypeId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/buildings/{buildingId}/rooms/quick-create")
    @PreAuthorize("hasAnyRole('LANDLORD')")
    public ResponseEntity<RoomResponse> quickCreateRoom(
            @PathVariable Long buildingId,
            @Valid @RequestBody QuickCreateRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.quickCreateRoom(buildingId, request));
    }
}
