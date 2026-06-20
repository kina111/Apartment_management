package com.apartment.management.shared.controller;

import com.apartment.management.shared.enums.FolderName;
import com.apartment.management.shared.service.CloudService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/test/cloud")
@RequiredArgsConstructor
@Tag(name = "Cloud Test", description = "Test endpoints for Cloudinary upload and delete")
public class CloudTestController {

    private final CloudService cloudService;

    @Operation(summary = "Upload image to Cloudinary")
    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(
            @Parameter(
                    description = "Image file",
                    content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE,
                            schema = @Schema(type = "string", format = "binary"))
            )
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "BUILDING") FolderName folder
    ) {
        String url = cloudService.uploadImage(file, folder);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @Operation(summary = "Upload video to Cloudinary")
    @PostMapping(value = "/videos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadVideo(
            @Parameter(
                    description = "Video file",
                    content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE,
                            schema = @Schema(type = "string", format = "binary"))
            )
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "BUILDING") FolderName folder
    ) {
        String url = cloudService.uploadVideo(file, folder);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteFile(@RequestParam("url") String url) {
        cloudService.deleteFile(url);
        return ResponseEntity.noContent().build();
    }
}
