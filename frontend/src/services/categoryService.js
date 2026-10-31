import api from "./api";

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export const getCategorieById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const addCategorie = async (data) => {
  const response = await api.post("/categories", data);
  return response.data;
};

export const updateCategorie = async (id, data) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategorie = async (id) => {
  await api.delete(`/categories/${id}`);
};
