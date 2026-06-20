package com.apartment.management.shared.service;

import com.apartment.management.shared.enums.FolderName;
import org.springframework.web.multipart.MultipartFile;

public interface CloudService {
    String uploadImage(MultipartFile file, FolderName folder);

    String uploadVideo(MultipartFile file, FolderName folder);

    void deleteFile(String url);
}
