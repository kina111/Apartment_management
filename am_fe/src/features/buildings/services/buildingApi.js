import axiosClient from "../../../shared/services/axiosClient.js";

function buildBuildingFormData(building, images = []) {
    const formData = new FormData();

    formData.append("name", building.name.trim());
    formData.append("address", building.address.trim());
    formData.append("numberOfFloor", String(building.numberOfFloor));

    if (building.description?.trim()) {
        formData.append("description", building.description.trim());
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