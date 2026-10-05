<template>
    <ListeDemandesValidees
        titre="LISTE DES DRFMS VALIDÉES"
        :columns="columns"
        :rows="liste"
        :loading="loading"
        but-link-path="signature/drfms/"
        :filter-options="filterOptions"
        current-nav="/signature/drfms"
    />
</template>

<script setup>
import { niveauDRFMS } from '~/assets/js/CommonVariable.js'
import ListeDemandesValidees from '~/components/ListeDemandesValidees.vue'

const supabase = useSupabaseClient()
const loading = ref(true)
const liste = ref([])

const columns = [
    { key: 'id', label: 'N°' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'id_user', label: 'Nom du demandeur' },
    { key: 'cat_pers', label: 'Personne soignée' },
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
                ses_items_drfms!inner ( id)
            `)
            .eq('cat_proc', 'drfms')
            .in('niv_val', [niveauDRFMS.valide, niveauDRFMS.cheque])
            .order('id', { ascending: false })

        if (error) throw error

        const map = new Map()
        for (const row of data || []) {
            if (!map.has(row.id)) {
                map.set(row.id, {
                    ...row,
                    nbrnv: row.ses_items_drfms?.length ?? 0,
                    date_original: row.date,
                    date: formatDate(row.date),
                    id_user: row.users?.full_name || 'Nom non trouvé',
                    cat_pers: row.cat_pers || '-'
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