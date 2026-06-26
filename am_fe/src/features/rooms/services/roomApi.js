import axiosClient from '../../../shared/services/axiosClient';

/**
 * Lấy danh sách phòng theo buildingId.
 */
export async function getRoomsByBuilding(buildingId) {
  const response = await axiosClient.get(`/buildings/${buildingId}/rooms`);
  return response.data;
}

/**
 * Lấy chi tiết một phòng.
 */
export async function getRoomById(roomId) {
  const response = await axiosClient.get(`/rooms/${roomId}`);
  return response.data;
}

export async function getAllTenantsByContractId(contractId) {
  const response = await axiosClient.get(`/tenants/contract/${contractId}`);
  return response.data;
}

/**
 * Lấy hợp đồng theo roomCode (và tùy chọn status).
 */
export async function getContractsByRoomId(roomCode, status) {
  const response = await axiosClient.get(`/contracts/${roomCode}`, {
    params: status ? { status } : {},
  });
  return response.data;
}