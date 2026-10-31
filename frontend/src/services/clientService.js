import api from "./api";

export const getClients = async () => {
  const response = await api.get("/clients");
  return response.data;
};

export const getClientById = async (id) => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
};

export const addClient = async (data) => {
  const response = await api.post("/clients", data);
  return response.data;
};

export const updateClient = async (id, data) => {
  const response = await api.put(`/clients/${id}`, data);
  return response.data;
};

export const deleteClient = async (id) => {
  await api.delete(`/clients/${id}`);
};
