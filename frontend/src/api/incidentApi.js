import client from './client';

export const createIncident = async (payload) => {
  const response = await client.post('/incidents', payload);
  return response.data;
};

export const getIncidents = async (params) => {
  const response = await client.get('/incidents', { params });
  return response.data;
};

export const getIncidentById = async (id) => {
  const response = await client.get(`/incidents/${id}`);
  return response.data;
};

export const updateIncident = async (id, payload) => {
  const response = await client.patch(`/incidents/${id}`, payload);
  return response.data;
};

export const updateIncidentStatus = async (id, payload) => {
  const response = await client.patch(`/incidents/${id}/status`, payload);
  return response.data;
};

export const assignResponder = async (id, responderId) => {
  const response = await client.patch(`/incidents/${id}/assign`, { responderId });
  return response.data;
};

export const deleteIncident = async (id) => {
  const response = await client.delete(`/incidents/${id}`);
  return response.data;
};

export const assignResourceToIncident = async (id, resourceId) => {
  const response = await client.patch(`/incidents/${id}/resources/assign`, { resourceId });
  return response.data;
};

export const releaseResourceFromIncident = async (id, resourceId) => {
  const response = await client.patch(`/incidents/${id}/resources/${resourceId}/release`);
  return response.data;
};
