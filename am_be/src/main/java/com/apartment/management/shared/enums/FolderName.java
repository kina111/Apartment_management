package com.apartment.management.shared.enums;

public enum FolderName {
    BUILDING("apartment-management/buildings"),
    CONTRACT("apartment-management/contracts");

    private final String path;

    FolderName(String path) {
        this.path = path;
    }

    public String getPath() {
        return path;
    }
}
