import api from "./api";

export const loginRequest = async (email, password) => {
  const response = await api.post("/login", { email, password });
  return response.data;
};

export const logoutRequest = async () => {
  await api.post("/logout");
};

export const getCurrentUser = async () => {
  const response = await api.get("/me");
  return response.data;
};
