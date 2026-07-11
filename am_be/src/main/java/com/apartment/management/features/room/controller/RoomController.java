package com.apartment.management.features.room.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apartment.management.features.room.dto.RoomResponse;
import com.apartment.management.features.room.service.IRoomService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
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
}
