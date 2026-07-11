package com.apartment.management.infrastructure.notification;

import com.apartment.management.shared.entity.Contract;
import com.apartment.management.shared.entity.Invoice;
import com.apartment.management.shared.entity.InvoiceDetail;
import com.apartment.management.shared.entity.Building;
import com.apartment.management.shared.entity.EmailConfiguration;
import com.apartment.management.shared.entity.Tenant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

import java.text.DecimalFormat;
import java.util.Properties;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements IEmailService {

    @Autowired(required = false)
    private JavaMailSender defaultMailSender;

    private JavaMailSender getMailSenderForBuilding(Building building) {
        if (building == null) {
            return defaultMailSender;
        }
        EmailConfiguration config = building.getEmailConfiguration();
        if (config == null || config.getSmtpUsername() == null || config.getSmtpUsername().isBlank()) {
            log.info("Building '{}' has no custom SMTP configuration. Using default mail sender.", building.getName());
            return defaultMailSender;
        }

        log.info("Building '{}' using dynamic SMTP sender: {}", building.getName(), config.getSmtpUsername());
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(config.getSmtpHost() != null ? config.getSmtpHost() : "smtp.gmail.com");
        mailSender.setPort(config.getSmtpPort() != null ? config.getSmtpPort() : 587);
        mailSender.setUsername(config.getSmtpUsername());
        mailSender.setPassword(config.getSmtpPassword());

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(Boolean.TRUE.equals(config.getSmtpAuth())));
        props.put("mail.smtp.starttls.enable", String.valueOf(Boolean.TRUE.equals(config.getSmtpStarttls())));
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");

        return mailSender;
    }

    private String getSenderEmail(Building building) {
        if (building != null && building.getEmailConfiguration() != null) {
            String customUser = building.getEmailConfiguration().getSmtpUsername();
            if (customUser != null && !customUser.isBlank()) {
                return customUser;
            }
        }
        return "holamanagement1712@gmail.com";
    }

    @Override
    public void sendMockInvoiceEmail(Contract contract, Invoice invoice) {
        String email = getContractHolderEmail(contract);
        if (email != null && !email.isBlank()) {
            log.info("[MOCK EMAIL SERVICE] Sending invoice notification email to: {}", email);
            log.info("[MOCK EMAIL SERVICE] Subject: Thông báo hóa đơn phòng {} tháng {}", contract.getRoom().getRoomCode(), invoice.getInvoiceMonth());
            log.info("[MOCK EMAIL SERVICE] Total amount due: {} VND", invoice.getTotalAmount());
            log.info("[MOCK EMAIL SERVICE] QR Payment link: {}", invoice.getPaymentUrlQrCode());
        }
    }

    @Override
    public void sendInvoiceEmail(Contract contract, Invoice invoice) {
        String email = getContractHolderEmail(contract);
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Tenant does not have a registered email address.");
        }

        Building building = contract.getRoom() != null ? contract.getRoom().getBuilding() : null;
        JavaMailSender activeMailSender = getMailSenderForBuilding(building);

        if (activeMailSender == null) {
            sendMockInvoiceEmail(contract, invoice);
            throw new IllegalStateException("SMTP Mail Sender is not configured on this environment.");
        }

        try {
            MimeMessage message = activeMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(getSenderEmail(building));
            helper.setTo(email);
            helper.setSubject("Thông báo hóa đơn phòng " + contract.getRoom().getRoomCode() + " tháng " + invoice.getInvoiceMonth());
            
            StringBuilder htmlContent = new StringBuilder();
            htmlContent.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>");
            htmlContent.append("<h2 style='color: #2b6cb0; border-bottom: 2px solid #2b6cb0; padding-bottom: 10px; margin-top: 0;'>HÓA ĐƠN TIỀN NHÀ DỊCH VỤ</h2>");
            htmlContent.append("<p>Kính gửi Quý khách thuê phòng <strong>").append(contract.getRoom().getRoomCode()).append("</strong>,</p>");
            htmlContent.append("<p>Hệ thống Apartment Management xin thông báo chi tiết hóa đơn dịch vụ tháng <strong>").append(invoice.getInvoiceMonth()).append("</strong> như sau:</p>");
            
            htmlContent.append("<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>");
            htmlContent.append("<thead><tr style='background-color: #f7fafc;'>");
            htmlContent.append("<th style='border: 1px solid #edf2f7; padding: 10px; text-align: left;'>Khoản chi phí</th>");
            htmlContent.append("<th style='border: 1px solid #edf2f7; padding: 10px; text-align: center;'>Số lượng</th>");
            htmlContent.append("<th style='border: 1px solid #edf2f7; padding: 10px; text-align: right;'>Đơn giá</th>");
            htmlContent.append("<th style='border: 1px solid #edf2f7; padding: 10px; text-align: right;'>Thành tiền</th>");
            htmlContent.append("</tr></thead><tbody>");
            
            DecimalFormat df = new DecimalFormat("#,###");
            for (InvoiceDetail d : invoice.getDetails()) {
                htmlContent.append("<tr>");
                htmlContent.append("<td style='border: 1px solid #edf2f7; padding: 10px;'>").append(d.getItemName());
                if (d.getOldIndex() != null && d.getNewIndex() != null) {
                    htmlContent.append("<br/><span style='font-size: 12px; color: #718096;'>Chỉ số: ").append(d.getOldIndex()).append(" &rarr; ").append(d.getNewIndex()).append("</span>");
                }
                htmlContent.append("</td>");
                htmlContent.append("<td style='border: 1px solid #edf2f7; padding: 10px; text-align: center;'>").append(d.getQuantity()).append("</td>");
                htmlContent.append("<td style='border: 1px solid #edf2f7; padding: 10px; text-align: right;'>").append(df.format(d.getUnitPrice())).append(" đ</td>");
                htmlContent.append("<td style='border: 1px solid #edf2f7; padding: 10px; text-align: right; font-weight: bold;'>").append(df.format(d.getSubTotal())).append(" đ</td>");
                htmlContent.append("</tr>");
            }
            
            htmlContent.append("<tr style='background-color: #edf2f7; font-weight: bold;'>");
            htmlContent.append("<td colspan='3' style='border: 1px solid #edf2f7; padding: 10px;'>Tổng cộng thanh toán</td>");
            htmlContent.append("<td style='border: 1px solid #edf2f7; padding: 10px; text-align: right; color: #2b6cb0; font-size: 16px;'>").append(df.format(invoice.getTotalAmount())).append(" đ</td>");
            htmlContent.append("</tr>");
            htmlContent.append("</tbody></table>");
            
            htmlContent.append("<p><strong>Hạn chót thanh toán:</strong> <span style='color: #e53e3e;'>").append(invoice.getDueDate().toString()).append("</span></p>");
            
            if (invoice.getPaymentUrlQrCode() != null && !invoice.getPaymentUrlQrCode().isBlank()) {
                htmlContent.append("<div style='text-align: center; margin: 30px 0; background-color: #f7fafc; padding: 20px; border-radius: 8px;'>");
                if (invoice.getPaymentUrlQrCode().contains("payos.vn")) {
                    htmlContent.append("<p style='font-weight: bold; margin-top: 0; color: #2d3748;'>Thanh toán hóa đơn trực tuyến qua cổng PayOS:</p>");
                    htmlContent.append("<a href='").append(invoice.getPaymentUrlQrCode()).append("' target='_blank' style='display: inline-block; padding: 12px 24px; background-color: #2b6cb0; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; font-size: 16px;'>Thanh toán ngay</a>");
                    htmlContent.append("<p style='font-size: 13px; color: #718096; margin-bottom: 0;'>Quý khách có thể quét mã QR hoặc sử dụng thẻ ATM/Internet Banking tại trang liên kết.</p>");
                } else {
                    htmlContent.append("<p style='font-weight: bold; margin-top: 0;'>Quét mã QR dưới đây bằng ứng dụng ngân hàng để thanh toán nhanh:</p>");
                    htmlContent.append("<img src='").append(invoice.getPaymentUrlQrCode()).append("' alt='VietQR Code' style='max-width: 200px; border: 1px solid #cbd5e0; padding: 8px; border-radius: 4px; background: white;'/>");
                    htmlContent.append("<p style='font-size: 13px; color: #718096; margin-bottom: 0;'><a href='").append(invoice.getPaymentUrlQrCode()).append("' target='_blank' style='color: #2b6cb0;'>Xem link thanh toán chi tiết</a></p>");
                }
                htmlContent.append("</div>");
            }
            
            htmlContent.append("<p style='color: #718096; font-size: 13px; border-top: 1px solid #edf2f7; padding-top: 15px;'>Đây là email tự động từ hệ thống quản lý căn hộ. Vui lòng liên hệ với Quản lý/Chủ nhà nếu có bất kỳ thắc mắc nào.</p>");
            htmlContent.append("</div>");
            
            helper.setText(htmlContent.toString(), true);
            activeMailSender.send(message);
            log.info("Successfully sent invoice email for Room {} to {}", contract.getRoom().getRoomCode(), email);
        } catch (Exception e) {
            log.error("SMTP error sending mail: ", e);
            throw new RuntimeException(e);
        }
    }

    @Override
    public void sendContractExpiryEmail(Contract contract, Tenant tenant) {
        if (tenant == null || tenant.getEmail() == null || tenant.getEmail().isBlank()) {
            log.warn("Cannot send contract expiry email. Tenant has no email configured.");
            return;
        }

        Building building = contract.getRoom() != null ? contract.getRoom().getBuilding() : null;
        JavaMailSender activeMailSender = getMailSenderForBuilding(building);

        if (activeMailSender == null) {
            log.warn("[MOCK] Contract expiry email to {}: Contract for room {} expired on {}.", tenant.getEmail(), contract.getRoom().getRoomCode(), contract.getEndDate());
            return;
        }

        try {
            MimeMessage message = activeMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(getSenderEmail(building));
            helper.setTo(tenant.getEmail());
            helper.setSubject("Thông báo hết hạn hợp đồng thuê phòng " + contract.getRoom().getRoomCode());

            StringBuilder htmlContent = new StringBuilder();
            htmlContent.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e53e3e; border-radius: 8px;'>");
            htmlContent.append("<h2 style='color: #e53e3e; border-bottom: 2px solid #e53e3e; padding-bottom: 10px; margin-top: 0;'>THÔNG BÁO HẾT HẠN HỢP ĐỒNG KHÁCH THUÊ</h2>");
            htmlContent.append("<p>Kính gửi cư dân <strong>").append(tenant.getName()).append("</strong>,</p>");
            htmlContent.append("<p>Hệ thống Apartment Management xin thông báo hợp đồng thuê phòng <strong>").append(contract.getRoom().getRoomCode()).append("</strong> của bạn đã hết hạn thuê.</p>");
            htmlContent.append("<p><strong>Chi tiết hợp đồng:</strong></p>");
            htmlContent.append("<ul>");
            htmlContent.append("<li><strong>Phòng ở:</strong> ").append(contract.getRoom().getRoomCode()).append("</li>");
            htmlContent.append("<li><strong>Ngày bắt đầu:</strong> ").append(contract.getStartDate().toString()).append("</li>");
            htmlContent.append("<li><strong>Ngày hết hạn:</strong> ").append(contract.getEndDate().toString()).append("</li>");
            htmlContent.append("<li><strong>Giá thuê:</strong> ").append(new DecimalFormat("#,###").format(contract.getRent())).append(" đ</li>");
            htmlContent.append("</ul>");
            htmlContent.append("<p>Vui lòng liên hệ ngay với Chủ nhà hoặc Quản lý tòa nhà để tiến hành gia hạn hợp đồng hoặc làm các thủ tục trả phòng theo quy định.</p>");
            htmlContent.append("<p style='color: #718096; font-size: 13px; border-top: 1px solid #edf2f7; padding-top: 15px;'>Đây là email tự động từ hệ thống quản lý căn hộ.</p>");
            htmlContent.append("</div>");

            helper.setText(htmlContent.toString(), true);
            activeMailSender.send(message);
            log.info("Successfully sent contract expiry email for Room {} to tenant {}", contract.getRoom().getRoomCode(), tenant.getEmail());
        } catch (Exception e) {
            log.error("SMTP error sending contract expiry mail: ", e);
        }
    }

    private String getContractHolderEmail(Contract contract) {
        if (contract == null || contract.getContractTenants() == null) {
            return null;
        }
        return contract.getContractTenants().stream()
                .filter(ct -> Boolean.TRUE.equals(ct.getIsContractHolder()))
                .map(ct -> ct.getTenant() != null ? ct.getTenant().getEmail() : null)
                .findFirst()
                .orElse(null);
    }
}

