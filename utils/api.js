import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api", // ton backend Symfony
    headers: {
    "Content-Type": "application/json",
    },
});

// Intercepteur pour ajouter automatiquement le token si présent
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
