package com.apartment.management.shared.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class CloudinaryConfig {

    private final CloudinaryProperties cloudinaryProperties;

    @Bean
    public Cloudinary getCloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", requireProperty(cloudinaryProperties.getCloudName(), "cloudinary.cloud-name"),
                "api_key", requireProperty(cloudinaryProperties.getApiKey(), "cloudinary.api-key"),
                "api_secret", requireProperty(cloudinaryProperties.getApiSecret(), "cloudinary.api-secret"),
                "secure", true,
                "upload_prefix", "https://api-ap.cloudinary.com"
        ));
    }

    private String requireProperty(String value, String propertyName) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(propertyName + " is required");
        }
        return value;
    }
}
