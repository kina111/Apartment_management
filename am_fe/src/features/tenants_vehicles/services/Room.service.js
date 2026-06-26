import axiosClient from "../../../shared/services/axiosClient";

const RoomService = {
    getTenantsByRoomCode: async (roomCode) => {
        return axiosClient.get(`/rooms/${roomCode}/tenants`);
    }
}

export default RoomService;