import api from "./api";

const projetService = {
  getProjets: async () => {
    try {
      const response = await api.get("/projets");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createProjet: async (data) => {
    try {
      const response = await api.post("/projets", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProjet: async (id, data) => {
    try {
      const response = await api.put(`/projets/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteProjet: async (id) => {
    try {
      await api.delete(`/projets/${id}`);
    } catch (error) {
      throw error;
    }
  },

  getProjet: async (id) => {
    try {
      const response = await api.get(`/projets/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default projetService;

export const getProjets = projetService.getProjets;
export const createProjet = projetService.createProjet;
export const updateProjet = projetService.updateProjet;
export const deleteProjet = projetService.deleteProjet;
export const getProjet = projetService.getProjet;
