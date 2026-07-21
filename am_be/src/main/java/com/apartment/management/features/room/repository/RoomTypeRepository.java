package com.apartment.management.features.room.repository;

import com.apartment.management.shared.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {
}
