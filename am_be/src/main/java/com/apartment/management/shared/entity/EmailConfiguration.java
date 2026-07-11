package com.apartment.management.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "email_configuration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "email_config_id")
    private Long emailConfigId;

    @Builder.Default
    @Column(name = "invoice_send_day", nullable = false)
    private Integer invoiceSendDay = 5;

    @Builder.Default
    @Column(name = "contract_expiry_reminder_days", nullable = false)
    private Integer contractExpiryReminderDays = 30;

    @Builder.Default
    @Column(name = "is_invoice_auto_send", nullable = false)
    private Boolean isInvoiceAutoSend = true;

    @Builder.Default
    @Column(name = "is_expiry_reminder_auto_send", nullable = false)
    private Boolean isExpiryReminderAutoSend = true;

    @Column(name = "smtp_host")
    private String smtpHost;

    @Column(name = "smtp_port")
    private Integer smtpPort;

    @Column(name = "smtp_username")
    private String smtpUsername;

    @Column(name = "smtp_password")
    private String smtpPassword;

    @Builder.Default
    @Column(name = "smtp_auth")
    private Boolean smtpAuth = true;

    @Builder.Default
    @Column(name = "smtp_starttls")
    private Boolean smtpStarttls = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", unique = true, nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Building building;
}
