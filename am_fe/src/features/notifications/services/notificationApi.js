import axiosClient from '../../../shared/services/axiosClient';

export const notificationApi = {
    sendFlexibleNotification: async (formData) => {
        const response = await axiosClient.post('/notifications/send', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },
    getEmailConfig: async (buildingId) => {
        const response = await axiosClient.get(`/notifications/email-config/${buildingId}`);
        return response.data;
    },
    saveEmailConfig: async (buildingId, data) => {
        const response = await axiosClient.post(`/notifications/email-config/${buildingId}`, data);
        return response.data;
    },
    getTargets: async (buildingId) => {
        const response = await axiosClient.get(`/notifications/targets/${buildingId}`);
        return response.data;
    }
};
