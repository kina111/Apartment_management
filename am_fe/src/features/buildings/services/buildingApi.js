import axiosClient from "../../../shared/services/axiosClient.js";

function buildBuildingFormData(building, images = []) {
    const formData = new FormData();

    formData.append("name", building.name.trim());
    formData.append("address", building.address.trim());
    formData.append("numberOfFloor", String(building.numberOfFloor));

    if (building.description?.trim()) {
        formData.append("description", building.description.trim());
    }

    if (building.area !== undefined) {
        formData.append("area", String(building.area));
    }

    if (building.numberOfBasement !== undefined) {
        formData.append("numberOfBasement", String(building.numberOfBasement));
    }

    if (building.totalRooms !== undefined) {
        formData.append("totalRooms", String(building.totalRooms));
    }

    if (building.yearBuilt !== undefined) {
        formData.append("yearBuilt", String(building.yearBuilt));
    }

    if (building.phoneNumber?.trim()) {
        formData.append("phoneNumber", building.phoneNumber.trim());
    }

    if (building.email?.trim()) {
        formData.append("email", building.email.trim());
    }

    if (building.landlordId) {
        formData.append("landlordId", String(building.landlordId));
    }

    images.forEach((image) => {
        formData.append("images", image);
    });

    return formData;
}

export async function createBuilding(building, images = []) {
    const formData = buildBuildingFormData(building, images);

    const response = await axiosClient.post("/buildings", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
}

export async function getMyBuildings(filters = {}) {
    const response = await axiosClient.get("/buildings/my", {
        params: {
            keyword: filters.keyword || undefined,
            minFloor: filters.minFloor || undefined,
            maxFloor: filters.maxFloor || undefined,
            hasImages: filters.hasImages === "" ? undefined : filters.hasImages,
            page: filters.page ?? 0,
            size: filters.size ?? 10,
            sort: filters.sort || "buildingId,desc",
        },
    });

    return response.data;
}

export async function getAllBuildingsByManagerId(managerId) {
    const response = await axiosClient.get("/buildings", {
        params: { managerId },
    });

    return response.data;
}

