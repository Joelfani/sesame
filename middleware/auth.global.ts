import { useUserStore } from "~/stores/user"

    // middleware/auth.global.ts
    export default defineNuxtRouteMiddleware(async (to) => {
    
        try {
            // Utilisation du module @nuxtjs/supabase
            const user = useSupabaseUser()
            const supabase = useSupabaseClient()
            // Pages publiques
            const publicPages = ['index', 'register', 'resetmdp']

            
            if (!user.value && !publicPages.includes(to.name as string)) {
            return navigateTo('/')
            }
            else{
                 //remplir le store user si il n'est pas rempli
                const userStore = useUserStore()
                if(!userStore.id){
                //session?.user => Si session n'est pas null ni undefined, alors accède à session.user. Sinon, retourne undefined.
                if (user?.value) {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.value.id)
                        .maybeSingle()
                    
                    if (userData) {
                        userStore.setUser(userData)
                    } 
                }
            }
            }
        } catch (error) {
            console.error('Erreur dans le middleware:', error)
        }
    })