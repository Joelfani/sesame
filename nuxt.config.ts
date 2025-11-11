export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
  ],
  
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '@/assets/css/main.css'
  ],
  
  app: {
    head: {
      title: 'Demande d\'achat - SESAME',
      
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  
  // Configuration explicite pour Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/',
      callback: '/',
      exclude: ['/', '/register']
    },
  },
})