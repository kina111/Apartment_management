package com.apartment.management.features.room.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.management.features.room.dto.CreateRoomTypeRequest;
import com.apartment.management.features.room.dto.QuickCreateRoomRequest;
import com.apartment.management.features.room.dto.RoomResponse;
import com.apartment.management.features.room.dto.RoomTypeResponse;
import com.apartment.management.features.room.service.IRoomService;

import lombok.RequiredArgsConstructor;

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
    public ResponseEntity<RoomTypeResponse> createRoomType(@Valid @RequestBody CreateRoomTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoomType(request));
    }

    @PutMapping("/room-types/{roomTypeId}")
    public ResponseEntity<RoomTypeResponse> updateRoomType(
            @PathVariable Long roomTypeId,
            @Valid @RequestBody CreateRoomTypeRequest request) {
        return ResponseEntity.ok(roomService.updateRoomType(roomTypeId, request));
    }

    @DeleteMapping("/room-types/{roomTypeId}")
    public ResponseEntity<Void> deleteRoomType(@PathVariable Long roomTypeId) {
        roomService.deleteRoomType(roomTypeId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/buildings/{buildingId}/rooms/quick-create")
    public ResponseEntity<RoomResponse> quickCreateRoom(
            @PathVariable Long buildingId,
            @Valid @RequestBody QuickCreateRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.quickCreateRoom(buildingId, request));
    }
}
