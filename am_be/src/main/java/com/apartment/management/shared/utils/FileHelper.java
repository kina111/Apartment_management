package com.apartment.management.shared.utils;

import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

public class FileHelper {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024;

    private FileHelper() {
    }

    public static void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return;
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPG, PNG, and WEBP images are allowed");
        }
        
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("Image size must not exceed 7MB");
        }

    }

}
