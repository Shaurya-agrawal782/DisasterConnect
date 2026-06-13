import client from './client';

export const trackIncidentByTicket = async (ticketNumber) => {
  const response = await client.get(`/incidents/track/${ticketNumber}`);
  return response.data;
};
