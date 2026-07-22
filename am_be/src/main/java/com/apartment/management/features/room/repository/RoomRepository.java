package com.apartment.management.features.room.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.apartment.management.shared.entity.Room;

public interface RoomRepository extends JpaRepository<Room, String> {

    @Query("SELECT r FROM Room r")
    @EntityGraph(attributePaths = {"roomType", "roomType.images"})
    List<Room> findAllWithDetails();

    @Query("SELECT r FROM Room r WHERE r.building.buildingId = :buildingId AND r.building.deleted = false")
    @EntityGraph(attributePaths = {"roomType", "roomType.images"})
    List<Room> findByBuildingId(Long buildingId);

    boolean existsByRoomType_RoomTypeId(Long roomTypeId);
}
