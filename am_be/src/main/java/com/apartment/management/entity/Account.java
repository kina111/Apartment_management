package com.apartment.management.entity;

import com.apartment.management.enums.AccountStatus;
import com.apartment.management.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "account")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "account_name", unique = true, nullable = false)
    private String accountName;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AccountStatus status;

    // Owned buildings relationship (Luồng own)
    @OneToMany(mappedBy = "landlord", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Building> ownedBuildings = new HashSet<>();

    // Managed buildings relationship (Luồng manage)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "Account_Buildings",
        joinColumns = @JoinColumn(name = "account_id"),
        inverseJoinColumns = @JoinColumn(name = "building_id")
    )
    @Builder.Default
    private Set<Building> buildings = new HashSet<>();
}
