import axiosClient from '../../../shared/services/axiosClient';

export async function createBuilding(payload, images = []) {
  const formData = new FormData();

  formData.append('name', payload.name.trim());
  formData.append('address', payload.address.trim());
  formData.append('numberOfFloor', String(payload.numberOfFloor));

  if (payload.description?.trim()) {
    formData.append('description', payload.description.trim());
  }

  if (payload.landlordId) {
    formData.append('landlordId', String(payload.landlordId));
  }

  images.forEach((image) => {
    formData.append('images', image);
  });

  const response = await axiosClient.post('/buildings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
