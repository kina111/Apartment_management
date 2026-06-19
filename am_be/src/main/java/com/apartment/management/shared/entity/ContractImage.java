package com.apartment.management.shared.entity;

import com.apartment.management.shared.enums.ImageType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "contract_image")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long imageId;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "image_type", nullable = false)
    private ImageType imageType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Contract contract;
}
