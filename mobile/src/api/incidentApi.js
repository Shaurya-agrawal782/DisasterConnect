import client from './client';

export const createIncident = async (payload) => {
  const response = await client.post('/incidents', payload);
  return response.data;
};

export const getIncidents = async (params) => {
  const response = await client.get('/incidents', { params });
  return response.data;
};
