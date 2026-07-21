package com.apartment.management.shared.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "building")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "building_id")
    private Long buildingId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "number_of_floor", nullable = false)
    private Integer numberOfFloor;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "description", columnDefinition = "nvarchar(max)")
    private String description;

    // Landlord owner relationship (luồng own)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id")
    private Account landlord;

    // Manager relationship (luồng manage)
    @ManyToMany(mappedBy = "buildings", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Account> managers = new HashSet<>();

    // Bank account relation
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id")
    private BankAccount bankAccount;

    // Email configuration relation
    @OneToOne(mappedBy = "building", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private EmailConfiguration emailConfiguration;

    // Building images relation (ON DELETE CASCADE is managed here via cascade and orphanRemoval)
    @OneToMany(mappedBy = "building", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<BuildingImage> images = new HashSet<>();

    // Rooms relation
    @OneToMany(mappedBy = "building", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Room> rooms = new HashSet<>();
}
