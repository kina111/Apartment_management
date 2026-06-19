package com.apartment.management.shared.entity;

import com.apartment.management.shared.enums.ChargeType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;

@Entity
@Table(name = "service_fee")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_fee_id")
    private Long serviceFeeId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "fee", nullable = false)
    private BigDecimal fee;

    @Enumerated(EnumType.STRING)
    @Column(name = "charge_type", nullable = false)
    private ChargeType chargeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Contract contract;
}
