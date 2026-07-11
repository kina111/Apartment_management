import axiosClient from '../../../shared/services/axiosClient';

export async function getDashboardStats(buildingId = null, accountId = 2) {
  const params = { accountId };
  if (buildingId) {
    params.buildingId = buildingId;
  }
  const response = await axiosClient.get('/billing/dashboard', { params });
  return response.data;
}

export async function getInvoices(filters = {}, accountId = 2) {
  const params = { accountId, ...filters };
  const response = await axiosClient.get('/billing/invoices', { params });
  return response.data;
}

export async function resendInvoiceEmail(invoiceId, accountId = 2) {
  const response = await axiosClient.put(`/billing/invoices/${invoiceId}/resend-email`, null, {
    params: { accountId },
  });
  return response.data;
}

export async function getInvoiceDetails(invoiceId, accountId = 2) {
  const response = await axiosClient.get(`/billing/invoices/${invoiceId}`, {
    params: { accountId },
  });
  return response.data;
}

export async function updateInvoiceStatus(invoiceId, payload, accountId = 2) {
  const response = await axiosClient.put(`/billing/invoices/${invoiceId}/status`, payload, {
    params: { accountId },
  });
  return response.data;
}

export async function voidInvoice(invoiceId, accountId = 2) {
  const response = await axiosClient.put(`/billing/invoices/${invoiceId}/void`, null, {
    params: { accountId },
  });
  return response.data;
}

export async function getCalculatePreview(buildingId, invoiceMonth, accountId = 2) {
  const response = await axiosClient.get('/billing/calculate/preview', {
    params: { buildingId, invoiceMonth, accountId },
  });
  return response.data;
}

export async function issueInvoices(payload, accountId = 2) {
  const response = await axiosClient.post('/billing/calculate/issue', payload, {
    params: { accountId },
  });
  return response.data;
}
