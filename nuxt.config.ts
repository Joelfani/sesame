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
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css' }
      ],
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
      exclude: ['/', '/register', '/resetmdp']
    },
  },
})