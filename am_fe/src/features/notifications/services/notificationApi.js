import axiosClient from '../../../shared/services/axiosClient';

export const notificationApi = {
    sendFlexibleNotification: (formData) => {
        return axiosClient.post('/notifications/send', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    },
    getEmailConfig: (buildingId) => {
        return axiosClient.get(`/notifications/email-config/${buildingId}`);
    },
    saveEmailConfig: (buildingId, data) => {
        return axiosClient.post(`/notifications/email-config/${buildingId}`, data);
    },
    getTargets: (buildingId) => {
        return axiosClient.get(`/notifications/targets/${buildingId}`);
    }
};
