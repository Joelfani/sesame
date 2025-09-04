export default defineNuxtRouteMiddleware(async (to) => {
  // récupérer supabase
    const { $supabase } = useNuxtApp()

  // vérifier si l'utilisateur est connecté
    const { data: { session }, error } = await $supabase.auth.getSession()

  // si pas connecté et que la page n'est pas login/register
    if (!session && !['index', 'register'].includes(to.name as string)) {
        return navigateTo('/')
    }
})