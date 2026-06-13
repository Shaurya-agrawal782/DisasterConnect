import client from './client';

export const getResponders = async (params = {}) => {
  const response = await client.get('/users/responders', { params });
  return response.data;
};

export const createResponder = async (payload) => {
  const response = await client.post('/users/responders', payload);
  return response.data;
};

export const updateResponderStatus = async (id, isActive) => {
  const response = await client.patch(`/users/responders/${id}/status`, { isActive });
  return response.data;
};

export const deleteResponder = async (id) => {
  const response = await client.delete(`/users/responders/${id}`);
  return response.data;
};
