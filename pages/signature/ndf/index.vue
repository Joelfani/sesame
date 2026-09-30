<template>
    <ListeDemandesValidees
        titre="LISTE DES NOTES DE FRAIS VALIDÉES"
        :columns="columns"
        :rows="liste"
        :loading="loading"
        but-link-path="signature/ndf/"
        :filter-options="filterOptions"
        current-nav="/signature/ndf"
    />
</template>

<script setup>
import { niveauNDF } from '~/assets/js/CommonVariable.js'
import ListeDemandesValidees from '~/components/ListeDemandesValidees.vue'

const supabase = useSupabaseClient()
const loading = ref(true)
const liste = ref([])

const columns = [
    { key: 'id', label: 'N°' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'id_user', label: 'Nom du demandeur' },
    { key: 'nbrnv', label: 'Nombre d\'articles validés' }
]

const filterOptions = [
    { value: 'num', label: 'N° d\'enregistrement', key: 'id' },
    { value: 'date', label: 'Date' },
    { value: 'id_user', label: 'Nom', key: 'id_user' }
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
                users: id_user ( full_name ),
                ses_items_ndf!inner ( id, niv_val )
            `)
            .eq('cat_proc', 'ndf')
            .eq('ses_items_ndf.niv_val', niveauNDF.valide)
            .order('id', { ascending: false })

        if (error) throw error

        const map = new Map()
        for (const row of data || []) {
            if (!map.has(row.id)) {
                map.set(row.id, {
                    ...row,
                    nbrnv: row.ses_items_ndf?.length ?? 0,
                    date_original: row.date,
                    date: formatDate(row.date),
                    id_user: row.users?.full_name || 'Nom non trouvé'
                })
            }
        }
        liste.value = [...map.values()]
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>