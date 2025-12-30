// middleware/auth.global.ts
import { useUserStore } from "~/stores/user"

export default defineNuxtRouteMiddleware(async (to) => {
    try {
        // Utilisation du module @nuxtjs/supabase
        const user = useSupabaseUser()
        const supabase = useSupabaseClient()
        const userStore = useUserStore()
        
        // Pages publiques (accessibles sans authentification)
        const publicPages = ['index', 'register', 'resetmdp']
        
        // Configuration des permissions requises pour chaque page
        const protectedRoutes = {
            'achat': 'achat',
            'afe': 'afe',
            'finance': 'finance',
            'dpr': 'dpr',
            'cheque': 'cheque',
            'livraison': 'livraison',
            'fournisseur': 'fournisseur',
            'signature': 'finance',
        }
        
        // Vérifier si l'utilisateur est connecté
        if (!user.value && !publicPages.includes(to.name as string)) {
            return navigateTo('/')
        }
        
        // Si l'utilisateur est connecté
        if (user.value) {
            // Remplir le store user s'il n'est pas rempli
            if (!userStore.id) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.value.id)
                    .maybeSingle()
                
                if (userData) {
                    userStore.setUser(userData)
                }
            }
            
            // Vérifier les permissions pour les routes protégées
            const routeName = to.name as string
            const routePath = to.path
            
            // Extraire le segment principal du chemin (ex: /achat/21 -> achat)
            const mainSegment = routePath.split('/')[1]
            
            // Si la route nécessite une permission spécifique
            // Vérifier à la fois par le nom de la route ET par le segment du chemin
            if (routeName in protectedRoutes || mainSegment in protectedRoutes) {
                const requiredPermission = protectedRoutes[routeName as keyof typeof protectedRoutes] 
                    || protectedRoutes[mainSegment as keyof typeof protectedRoutes]
                
                // Vérifier si l'utilisateur a la permission requise
                if (!userStore[requiredPermission as keyof typeof userStore]) {
                    console.warn(`Accès refusé à ${routePath}. Permission requise: ${requiredPermission}`)
                    return navigateTo('/demande')
                }
            }
            
            // Vérifier les routes admin (si type_compte === 1)
            const adminRoutes = ['utilisateur', 'imputation', 'historique']
            const isAdminRoute = adminRoutes.includes(routeName) || adminRoutes.includes(mainSegment)
            
            if (isAdminRoute && userStore.type_compte !== 1) {
                console.warn(`Accès refusé à la page admin ${routePath}`)
                return navigateTo('/demande')
            }
        }
        
    } catch (error) {
        console.error('Erreur dans le middleware:', error)
        return navigateTo('/demande')
    }
})