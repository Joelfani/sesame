// plugins/supabaseService.ts
import { useNuxtApp } from '#app' // useNuxtApp() te permet d’accéder à tous les plugins et instances injectés dans Nuxt, dont notre $supabase.

export const useSupabaseTable = (tableName) => {
  const { $supabase } = useNuxtApp() // Accès à l'instance Supabase créée dans le plugin, il contient les méthodes pour interagir avec la base de données.(.from, .select, .insert, .update, .delete, etc.)

  return {
    getAll: async () => {
      const { data, error } = await $supabase.from(tableName).select('*')
      return { data, error }
    },

    insert: async (row) => {
      const { data, error } = await $supabase.from(tableName).insert([row])
      return { data, error }
    },

    update: async (row, match) => {
      const { data, error } = await $supabase.from(tableName).update(row).match(match)
      return { data, error }
    },

    delete: async (match) => {
      const { data, error } = await $supabase.from(tableName).delete().match(match)
      return { data, error }
    }
  }
}



/*import axios from "axios";

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

export default api;*/
