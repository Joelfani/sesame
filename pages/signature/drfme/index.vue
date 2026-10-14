<template>
    <ListeDemandesValidees
        titre="LISTE DES DRFME VALIDÉES"
        :columns="columns"
        :rows="liste"
        :loading="loading"
        but-link-path="signature/drfme/"
        :filter-options="filterOptions"
        current-nav="/signature/drfme"
    />
</template>

<script setup>
import { niveauDRFME } from '~/assets/js/CommonVariable.js'
import ListeDemandesValidees from '~/components/ListeDemandesValidees.vue'

const supabase = useSupabaseClient()
const loading = ref(true)
const liste = ref([])

const columns = [
    { key: 'id', label: 'N°' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'id_user', label: 'Nom du demandeur' },
    { key: 'projet', label: 'Projet' },
    { key: 'nbrnv', label: 'Nombre d\'articles validés' }
]

const filterOptions = [
    { value: 'num', label: 'N° d\'enregistrement', key: 'id' },
    { value: 'date', label: 'Date' },
    { value: 'id_user', label: 'Nom', key: 'id_user' },
    { value: 'projet', label: 'Projet', key: 'projet' }
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
                ses_items_drfme!inner ( id, niv_val )
            `)
            .eq('cat_proc', 'drfme')
            .in('ses_items_drfme.niv_val', [niveauDRFME.valide, niveauDRFME.cheque])
            .order('id', { ascending: false })

        if (error) throw error

        const map = new Map()
        for (const row of data || []) {
            if (!map.has(row.id)) {
                map.set(row.id, {
                    ...row,
                    nbrnv: row.ses_items_drfme?.length ?? 0,
                    date_original: row.date,
                    date: formatDate(row.date),
                    id_user: row.users?.full_name || 'Nom non trouvé',
                    projet: row.projet || '-'
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