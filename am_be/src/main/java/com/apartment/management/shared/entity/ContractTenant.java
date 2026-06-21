package com.apartment.management.shared.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "contract_tenants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractTenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contract_tenant_id")
    private Long contractTenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "is_contract_holder", nullable = false)
    private Boolean isContractHolder;

    @Column(name = "join_date", nullable = false)
    private LocalDate joinDate;

    @Column(name = "leave_date")
    private LocalDate leaveDate;
}
