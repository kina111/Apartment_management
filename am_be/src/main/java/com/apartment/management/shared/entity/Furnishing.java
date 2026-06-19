package com.apartment.management.shared.entity;

import com.apartment.management.shared.enums.FurnishingStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "furnishing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Furnishing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "furnishing_id")
    private Long furnishingId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FurnishingStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_code")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "furnishing_type_id")
    private FurnishingType furnishingType;
}
