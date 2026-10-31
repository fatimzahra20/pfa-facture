import api from "./api";

export const getFactures = async () => {
  const response = await api.get("/factures");
  return response.data;
};

export const getFactureById = async (id) => {
  const response = await api.get(`/factures/${id}`);
  return response.data;
};

export const getFacturesByClient = async (clientId) => {
  const response = await api.get(`/factures?client_id=${clientId}`);
  return response.data;
};

export const addFacture = async (data) => {
  const response = await api.post("/factures", data);
  return response.data;
};

export const updateFacture = async (id, data) => {
  const response = await api.put(`/factures/${id}`, data);
  return response.data;
};

export const deleteFacture = async (id) => {
  await api.delete(`/factures/${id}`);
};

const extractInvoiceNumber = (numero) => {
  const match = String(numero || "").match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
};

export const getNextFactureNumber = async () => {
  const factures = await getFactures();
  const lastNumber = factures.reduce((max, facture) => {
    return Math.max(max, extractInvoiceNumber(facture.numero));
  }, 0);

  return `FAC-${String(lastNumber + 1).padStart(4, "0")}`;
};
