package com.apartment.management.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "building")
@SQLDelete(sql = "UPDATE building SET deleted = 1, deleted_at = GETDATE() WHERE building_id = ?")
@SQLRestriction("deleted = 0")
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

    @Nationalized
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "number_of_floor", nullable = false)
    private Integer numberOfFloor;

    @Nationalized
    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Nationalized
    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "area")
    private Double area;

    @Column(name = "number_of_basement")
    private Integer numberOfBasement;

    @Column(name = "total_rooms")
    private Integer totalRooms;

    @Column(name = "year_built")
    private Integer yearBuilt;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "email")
    private String email;

    @Builder.Default
    @Column(name = "deleted", nullable = false, columnDefinition = "BIT DEFAULT 0")
    private Boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

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
