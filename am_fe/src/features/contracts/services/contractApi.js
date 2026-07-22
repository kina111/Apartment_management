import axiosClient from '../../../shared/services/axiosClient';

export async function searchContracts(search = '', status = '', page = 0, size = 10) {
  const params = { page, size };
  if (search) params.search = search;
  if (status) params.status = status;
  
  const response = await axiosClient.get('/contracts', { params });
  return response.data;
}

export async function getContractById(contractId) {
  const response = await axiosClient.get(`/contracts/id/${contractId}`);
  return response.data;
}

export async function createContract(formData) {
  const response = await axiosClient.post('/contracts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function renewContract(contractId, formData) {
  const response = await axiosClient.post(`/contracts/${contractId}/renew`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function transferContract(contractId, formData) {
  const response = await axiosClient.post(`/contracts/${contractId}/transfer`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function terminateContract(contractId, formData) {
  const response = await axiosClient.post(`/contracts/${contractId}/terminate`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function getAvailableTenants() {
  const response = await axiosClient.get('/contracts/tenants/available');
  return response.data;
}
