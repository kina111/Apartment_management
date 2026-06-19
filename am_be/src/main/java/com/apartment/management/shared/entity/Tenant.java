package com.apartment.management.shared.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tenant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tenant_id")
    private Long tenantId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "permanent_address", nullable = false)
    private String permanentAddress;

    @Column(name = "citizen_id", nullable = false)
    private String citizenId;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "is_contract_holder", nullable = false)
    private Boolean isContractHolder;

    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<EmergencyContact> emergencyContacts = new HashSet<>();

    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Vehicle> vehicles = new HashSet<>();

    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Contract> contracts = new HashSet<>();
}
