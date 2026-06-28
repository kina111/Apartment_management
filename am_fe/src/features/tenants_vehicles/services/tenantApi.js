import axiosClient from "../../../shared/services/axiosClient";

const tenantService = {
    getTenantsByRoomCode: async (roomCode) => {
        const response = await axiosClient.get(`/rooms/${roomCode}/tenants`);
        return response.data;
    },

    getTenantsByBuildingId: async (buildingId) => {
        const response = await axiosClient.get(`/tenants/buildings/${buildingId}`);
        return response.data;
    }
}

export default tenantService;
    