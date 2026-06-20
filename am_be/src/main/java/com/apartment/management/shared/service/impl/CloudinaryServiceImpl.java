package com.apartment.management.shared.service.impl;

import com.apartment.management.shared.enums.FolderName;
import com.apartment.management.shared.service.CloudService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudService {

    private static final String IMAGE_RESOURCE_TYPE = "image";
    private static final String VIDEO_RESOURCE_TYPE = "video";
    private static final String UPLOAD_SEGMENT = "/upload/";
    private static final int VIDEO_CHUNK_SIZE = 6_000_000;

    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile file, FolderName folder) {
        validateFile(file, "image/");
        validateFolder(folder);

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder.getPath(),
                    "public_id", UUID.randomUUID().toString(),
                    "resource_type", IMAGE_RESOURCE_TYPE
            ));
            return String.valueOf(result.get("secure_url"));
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to upload image to Cloudinary", exception);
        }
    }

    @Override
    public String uploadVideo(MultipartFile file, FolderName folder) {
        validateFile(file, "video/");
        validateFolder(folder);

        try (InputStream inputStream = file.getInputStream()) {
            Map<?, ?> result = cloudinary.uploader().uploadLarge(inputStream, ObjectUtils.asMap(
                    "folder", folder.getPath(),
                    "public_id", UUID.randomUUID().toString(),
                    "resource_type", VIDEO_RESOURCE_TYPE,
                    "chunk_size", VIDEO_CHUNK_SIZE
            ));
            return String.valueOf(result.get("secure_url"));
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to upload video to Cloudinary", exception);
        }
    }

    @Override
    public void deleteFile(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("File URL is required");
        }

        String publicId = extractPublicId(url);
        String resourceType = extractResourceType(url);

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to delete file from Cloudinary", exception);
        }
    }

    private void validateFolder(FolderName folder) {
        if (folder == null) {
            throw new IllegalArgumentException("Folder is required");
        }
    }

    private void validateFile(MultipartFile file, String expectedContentTypePrefix) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith(expectedContentTypePrefix)) {
            throw new IllegalArgumentException("Invalid file type");
        }
    }

    private String extractResourceType(String url) {
        if (url.contains("/video/")) {
            return VIDEO_RESOURCE_TYPE;
        }
        return IMAGE_RESOURCE_TYPE;
    }

    private String extractPublicId(String url) {
        int uploadIndex = url.indexOf(UPLOAD_SEGMENT);
        if (uploadIndex < 0) {
            throw new IllegalArgumentException("Invalid Cloudinary URL");
        }

        String path = url.substring(uploadIndex + UPLOAD_SEGMENT.length());
        String[] segments = path.split("/");
        int startIndex = segments.length > 0 && segments[0].matches("v\\d+") ? 1 : 0;

        StringBuilder publicId = new StringBuilder();
        for (int index = startIndex; index < segments.length; index++) {
            if (publicId.length() > 0) {
                publicId.append('/');
            }
            publicId.append(segments[index]);
        }

        int extensionIndex = publicId.lastIndexOf(".");
        if (extensionIndex > 0) {
            publicId.delete(extensionIndex, publicId.length());
        }

        if (publicId.isEmpty()) {
            throw new IllegalArgumentException("Invalid Cloudinary URL");
        }

        return publicId.toString();
    }
}
