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

async function createBuilding(building, images = []) {
    const response = await axiosClient.post("/buildings", buildBuildingFormData(building, images));

    return response.data;
}

async function updateBuilding(buildingId, building, images = []) {
    const response = await axiosClient.put(`/buildings/${buildingId}`, buildBuildingFormData(building, images));

    return response.data;
}

async function getBuildingDetail(buildingId) {
    const response = await axiosClient.get(`/buildings/${buildingId}`);

    return response.data;
}

async function deleteBuilding(buildingId) {
    await axiosClient.delete(`/buildings/${buildingId}`);
}

async function updateBuildingBankAccount(buildingId, bankAccount) {
    const response = await axiosClient.put(`/buildings/${buildingId}/bank-account`, {
        bankName: bankAccount.bankName.trim(),
        accountNumber: bankAccount.accountNumber.trim(),
        userName: bankAccount.userName.trim(),
    });

    return response.data;
}

async function getMyBuildings(filters = {}) {
    const response = await axiosClient.get("/buildings/my", {
        params: {
            keyword: filters.keyword || undefined,
            landlordId: filters.landlordId || undefined,
            managerId: filters.managerId || undefined,
            minFloor: filters.minFloor || undefined,
            maxFloor: filters.maxFloor || undefined,
            page: filters.page ?? 0,
            size: filters.size ?? 10,
            sort: filters.sort || "buildingId,desc",
        },
    });

    return response.data;
}

async function getMyBuildingOptions() {
    const response = await axiosClient.get("/buildings/my-options");

    return response.data;
}

async function getAllBuildingsByManagerId(managerId) {
    const response = await axiosClient.get("/buildings", {
        params: { managerId },
    });

    return response.data;
}

const buildingApi = {
    createBuilding,
    updateBuilding,
    getBuildingDetail,
    deleteBuilding,
    updateBuildingBankAccount,
    getMyBuildings,
    getMyBuildingOptions,
    getAllBuildingsByManagerId,
};

export default buildingApi;
