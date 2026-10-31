import api from "./api";

export const getImpots = async () => {
  const response = await api.get("/impots");
  return response.data;
};

export const getImpotById = async (id) => {
  const response = await api.get(`/impots/${id}`);
  return response.data;
};

export const createImpot = async (data) => {
  const response = await api.post("/impots", data);
  return response.data;
};

export const updateImpot = async (id, data) => {
  const response = await api.put(`/impots/${id}`, data);
  return response.data;
};

export const markImpotAsPaid = async (id, proofFile) => {
  const formData = new FormData();
  formData.append("preuve_paiement", proofFile);

  const response = await api.post(`/impots/${id}/mark-paid`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteImpot = async (id) => {
  const response = await api.delete(`/impots/${id}`);
  return response.data;
};

export const getDueImpots = async () => {
  const response = await api.get("/impots/due");
  return response.data;
};

export const getImpostByStatut = async (statut) => {
  const response = await api.get(`/impots/by-statut?statut=${statut}`);
  return response.data;
};
