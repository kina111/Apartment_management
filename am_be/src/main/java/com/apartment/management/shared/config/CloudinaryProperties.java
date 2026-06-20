package com.apartment.management.shared.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Component
@ConfigurationProperties(prefix = "cloudinary")
@Validated
@Getter
@Setter
public class CloudinaryProperties {

    private String cloudName;
    private String apiKey;
    private String apiSecret;
}
