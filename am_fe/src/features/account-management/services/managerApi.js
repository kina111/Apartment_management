import axiosClient from "../../../shared/services/axiosClient";

const managerApi = {
  getAll: () => {
    return axiosClient.get("/account-management/managers");
  },

  create: (data) => {
    return axiosClient.post("/account-management/managers", data);
  },

  update: (id, data) => {
    return axiosClient.put(`/account-management/managers/${id}`, data);
  },

  delete: (id) => {
    return axiosClient.delete(`/account-management/managers/${id}`);
  },

  // Needed for selecting buildings in the creation form
  getBuildings: () => {
    return axiosClient.get("/buildings/my-options");
  }
};

export default managerApi;
