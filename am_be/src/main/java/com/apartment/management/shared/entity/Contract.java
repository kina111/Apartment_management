package com.apartment.management.shared.entity;

import com.apartment.management.shared.enums.ContractStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "contract")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contract_id")
    private Long contractId;

    @Column(name = "rent", nullable = false)
    private BigDecimal rent;

    @Column(name = "deposit_amount", nullable = false)
    private BigDecimal depositAmount;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContractStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_code", nullable = false)
    private Room room;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<ContractTenant> contractTenants = new HashSet<>(); 

    // Self-referencing relationship for renewals (HĐ gia hạn nối tiếp HĐ cũ)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_contract_id")
    private Contract parentContract;

    @OneToMany(mappedBy = "parentContract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Contract> renewalContracts = new HashSet<>();

    // Child mappings
    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<ServiceFee> serviceFees = new HashSet<>();

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<ContractImage> images = new HashSet<>();

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Invoice> invoices = new HashSet<>();
}
