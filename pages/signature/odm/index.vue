<template>
    <ListeDemandesValidees
        titre="LISTE DES ORDRES DE MISSION VALIDÉS"
        :columns="columns"
        :rows="liste"
        :loading="loading"
        but-link-path="signature/odm/"
        :filter-options="filterOptions"
        current-nav="/signature/odm"
    />
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'
import ListeDemandesValidees from '~/components/ListeDemandesValidees.vue'

const supabase = useSupabaseClient()
const loading = ref(true)
const liste = ref([])

const columns = [
    { key: 'id', label: 'N°' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'id_user', label: 'Nom du demandeur' },
    { key: 'miss_obj', label: 'Objet de la mission' }
]

const filterOptions = [
    { value: 'num', label: 'N° d\'enregistrement', key: 'id' },
    { value: 'date', label: 'Date' },
    { value: 'id_user', label: 'Nom', key: 'id_user' },
    { value: 'objet', label: 'Objet', key: 'miss_obj' }
]

const formatDate = (d) => {
    if (!d) return ''
    const x = new Date(d)
    return `${String(x.getDate()).padStart(2, '0')}/${String(x.getMonth() + 1).padStart(2, '0')}/${x.getFullYear()}`
}

const load = async () => {
    loading.value = true
    try {
        const { data, error } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name )
            `)
            .eq('cat_proc', 'odm')
            .eq('niv_val', niveauODM.valide)
            .order('id', { ascending: false })

        if (error) throw error

        liste.value = (data || []).map(row => ({
            ...row,
            date_original: row.date,
            date: formatDate(row.date),
            id_user: row.users?.full_name || 'Nom non trouvé',
            miss_obj: row.miss_obj || '-'
        }))
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>