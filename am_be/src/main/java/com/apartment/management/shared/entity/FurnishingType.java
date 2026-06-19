package com.apartment.management.shared.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "furnishing_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FurnishingType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "furnishing_type_id")
    private Long furnishingTypeId;

    @Column(name = "name", nullable = false)
    private String name;
}
