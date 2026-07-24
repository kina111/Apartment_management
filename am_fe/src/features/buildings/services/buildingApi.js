import axiosClient from "../../../shared/services/axiosClient.js";

const multipartConfig = {
    headers: {
        "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
};

function buildBuildingFormData(building) {
    const formData = new FormData();

    formData.append("name", building.name.trim());
    formData.append("address", building.address.trim());
    formData.append("numberOfFloor", String(building.numberOfFloor));

    building.images?.forEach((image) => {
        formData.append("images", image);
    });

    return formData;
}

async function createBuilding(building) {
    const response = await axiosClient.post("/buildings", buildBuildingFormData(building), multipartConfig);

    return response.data;
}

async function updateBuilding(buildingId, building) {
    const response = await axiosClient.put(`/buildings/${buildingId}`, buildBuildingFormData(building), multipartConfig);

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
            minFloor: filters.minFloor || undefined,
            maxFloor: filters.maxFloor || undefined,
        },
    });

    return response.data;
}

/*async function getMyBuildings(filters = {}) {
    const query = new URLSearchParams();
    if (filters.keyword) {
        query.set("keyword", filters.keyword);
    }

    if (filters.minFloor) {
        query.set("minFloor", filters.minFloor);
    }

    if (filters.maxFloor) {
        query.set("maxFloor", filters.maxFloor);
    }

    const queryString = query.toString();
    const url = queryString ? `/buildings/my?${queryString}` : "/buildings/my";
    const response = await axiosClient.get(url);
    return response.data;
}*/

async function getMyBuildingOptions() {
    const response = await axiosClient.get("/buildings/my-options");

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
};

export default buildingApi;
