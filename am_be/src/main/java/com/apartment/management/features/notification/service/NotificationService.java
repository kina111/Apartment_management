package com.apartment.management.features.notification.service;

import com.apartment.management.features.auth.repository.AccountRepository;
import com.apartment.management.features.notification.dto.EmailRequest;
import com.apartment.management.features.tenants_vehicles.repository.TenantRepository;
import com.apartment.management.shared.entity.Account;
import com.apartment.management.shared.entity.Tenant;
import com.apartment.management.shared.entity.EmailConfiguration;
import com.apartment.management.features.notification.repository.EmailConfigurationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final TenantRepository tenantRepository;
    private final AccountRepository accountRepository;
    private final EmailConfigurationRepository emailConfigurationRepository;

    @Async
    public void sendFlexibleNotification(EmailRequest request, Long landlordId) {
        if (request.getBuildingId() == null) {
            throw new IllegalArgumentException("Vui lòng chọn tòa nhà.");
        }

        EmailConfiguration emailConfig = emailConfigurationRepository.findByBuilding_BuildingId(request.getBuildingId())
                .orElseThrow(() -> new RuntimeException("Chưa cấu hình Email cho tòa nhà này. Vui lòng lưu cấu hình SMTP trước khi gửi."));

        if (emailConfig.getSenderEmail() == null || emailConfig.getSenderPassword() == null) {
            throw new RuntimeException("Cấu hình Email bị thiếu. Vui lòng kiểm tra lại cấu hình SMTP.");
        }

        JavaMailSenderImpl mailSender = createMailSender(emailConfig.getSenderEmail(), emailConfig.getSenderPassword());

        Set<String> recipientEmails = new HashSet<>();

        switch (request.getTargetScope()) {
            case ALL_TENANTS:
                List<Tenant> tenants = tenantRepository.findTenantsByBuildingId(request.getBuildingId());
                recipientEmails.addAll(tenants.stream().map(Tenant::getEmail).collect(Collectors.toSet()));
                break;
            case ALL_MANAGERS:
                List<Account> managers = accountRepository.findManagersByBuildingId(request.getBuildingId());
                recipientEmails.addAll(managers.stream().map(Account::getEmail).collect(Collectors.toSet()));
                break;
            case SPECIFIC:
                if (request.getSpecificTenantIds() != null && !request.getSpecificTenantIds().isEmpty()) {
                    List<Tenant> specificTenants = tenantRepository.findAllById(request.getSpecificTenantIds());
                    recipientEmails.addAll(specificTenants.stream().map(Tenant::getEmail).collect(Collectors.toSet()));
                }
                if (request.getSpecificManagerIds() != null && !request.getSpecificManagerIds().isEmpty()) {
                    List<Account> specificManagers = accountRepository.findAllById(request.getSpecificManagerIds());
                    recipientEmails.addAll(specificManagers.stream().map(Account::getEmail).collect(Collectors.toSet()));
                }
                break;
        }

        // Filter out empty or null emails
        recipientEmails = recipientEmails.stream()
                .filter(email -> email != null && !email.trim().isEmpty())
                .collect(Collectors.toSet());

        if (recipientEmails.isEmpty()) {
            log.warn("No recipients found for notification scope: {}", request.getTargetScope());
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            // Use multipart if there are attachments
            boolean multipart = request.getAttachments() != null && !request.getAttachments().isEmpty();
            MimeMessageHelper helper = new MimeMessageHelper(message, multipart, "UTF-8");

            helper.setFrom(emailConfig.getSenderEmail());
            // Using BCC to protect privacy
            helper.setBcc(recipientEmails.toArray(new String[0]));
            // To prevent empty 'To' field issues in some clients
            helper.setTo(emailConfig.getSenderEmail());
            helper.setSubject(request.getSubject());
            helper.setText(request.getContent(), true); // true indicates HTML content

            if (multipart) {
                for (MultipartFile file : request.getAttachments()) {
                    if (file != null && !file.isEmpty()) {
                        helper.addAttachment(file.getOriginalFilename(), file);
                    }
                }
            }

            mailSender.send(message);
            log.info("Successfully sent notification to {} recipients", recipientEmails.size());

        } catch (MessagingException e) {
            log.error("Failed to send flexible notification", e);
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage(), e);
        }
    }

    private JavaMailSenderImpl createMailSender(String email, String password) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername(email);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "false"); // Set to true for debugging if needed

        return mailSender;
    }
}
