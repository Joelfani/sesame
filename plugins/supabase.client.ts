//importation de la fonction createClient depuis le SDK supabase pour connecter l'application à la base de données
import { createClient } from '@supabase/supabase-js';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

//importation de la fonction defineNuxtPlugin pour définir un plugin Nuxt.js
    export default defineNuxtPlugin(() => {
    //
    const config = useRuntimeConfig()

    const supabase = createClient(
        config.public.supabaseUrl,
        config.public.supabaseAnonKey,
        {
            auth: {
            persistSession: true,   // garde la session en localStorage
            detectSessionInUrl: true, // nécessaire si tu utilises le login par magie de lien/email
            },
        }
    )

    return {
        provide: {
        supabase
        }
    }
    })
