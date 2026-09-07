import axios from "axios";
import { CLAVE_TOKEN } from "../utils/constants";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(CLAVE_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      // Prevenir bucles de redirección si falla la autenticación de login
      if (!url.includes("/auth/login")) {
        console.warn("Respuesta 401 recibida de la API para:", url);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;