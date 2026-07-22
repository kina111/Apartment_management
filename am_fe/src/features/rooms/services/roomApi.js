import axiosClient from '../../../shared/services/axiosClient';

/**
 * Lấy danh sách phòng theo buildingId.
 */
export async function getRoomsByBuilding(buildingId) {
  const response = await axiosClient.get(`/buildings/${buildingId}/rooms`);
  return response.data;
}

export async function quickCreateRoom(buildingId, data) {
  const response = await axiosClient.post(`/buildings/${buildingId}/rooms/quick-create`, data);
  return response.data;
}

export async function getRoomTypes() {
  const response = await axiosClient.get('/room-types');
  return response.data;
}

export async function createRoomType(data) {
  const response = await axiosClient.post('/room-types', data);
  return response.data;
}

export async function updateRoomType(roomTypeId, data) {
  const response = await axiosClient.put(`/room-types/${roomTypeId}`, data);
  return response.data;
}

export async function deleteRoomType(roomTypeId) {
  await axiosClient.delete(`/room-types/${roomTypeId}`);
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
 * Lấy hợp đồng ACTIVE theo roomCode.
 */
export async function getActiveContractByRoomCode(roomCode) {
  const response = await axiosClient.get(`/contracts/active/${roomCode}`);
  return response.data;
}

export async function addTenantToContract(contractId, data) {
  return axiosClient.post(`/tenants/contract/${contractId}/add-tenant`, data);
}

export async function tenantLeave(contractId, tenantId){
  return axiosClient.put(`/tenants/contract/${contractId}/tenant/${tenantId}/leave`);
}

export async function updateTenant(tenantId, data){
  return axiosClient.put(`/tenants/${tenantId}`, data);
}

export async function addVehicleToTenant(tenantId, data){
  return axiosClient.post(`/tenants/${tenantId}/vehicles`, data);
}

export async function deleteVehicleFromTenant(tenantId, vehicleId){
  return axiosClient.delete(`/tenants/${tenantId}/vehicles/${vehicleId}`);
}
