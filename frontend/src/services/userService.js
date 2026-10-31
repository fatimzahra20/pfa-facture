import api from "./api";

export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const updateUserProfile = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const updateUserPassword = async (id, password) => {
  const response = await api.put(`/users/${id}/password`, { password });
  return response.data;
};

export const deleteUserProfile = async (id) => {
  await api.delete(`/users/${id}`);
};
