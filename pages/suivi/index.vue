<template>
    <ListeSuiviGeneric
        titre="SUIVI DE TOUTES LES DEMANDES D'ACHAT"
        :columns="columns"
        :rows="liste_demande"
        :loading="loading"
        but-link-path="suivi/"
        name-but-action="Voir"
        :filter-options="filterOptions"
        search-placeholder="Rechercher une demande"
        :show-export="canExport"
        export-label="Exportation des demandes"
        :show-mini-nav="true"
        link-selected="/suivi"
        base-link="suivi"
        :view-d-r-f-m-s="userStore.finance || userStore.cg || userStore.cheque || userStore.dpr || userStore.rh ? true : false"
        @export="exportToExcel"
    />
</template>

<script setup>
import { niveau } from '~/assets/js/CommonVariable.js'
import { exportExcel } from '~/assets/js/export'
import ListeSuiviGeneric from '~/components/ListeSuiviGeneric.vue'

const supabase = useSupabaseClient()
const userStore = useUserStore()

const loading = ref(true)
const liste_demande = ref([])

const columns = [
    { key: 'id', label: 'N° d\'enregistrement' },
    { key: 'date', label: 'Date de la demande' },
    { key: 'nom_user', label: 'Demandeur' },
    { key: 'service', label: 'Service' },
    { key: 'nom', label: 'Objet de la demande' },
    { key: 'niv_val', label: 'Status de la demande' },
    { key: 'nb_rectifications', label: 'Nbrs rectifications' }
]

const filterOptions = [
    { value: 'num', label: 'N° d\'enregistrement', key: 'id' },
    { value: 'nom', label: 'Nom du demandeur', key: 'nom_user' },
    { value: 'date', label: 'Date' },
    { value: 'nomObj', label: 'Objet de la demande', key: 'nom' }
]

const canExport = computed(() =>
    userStore.type_compte === 1 ||
    userStore.achat ||
    userStore.finance ||
    userStore.cg ||
    userStore.cheque
)

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

const getDemande = async () => {
    loading.value = true
    try {
        let query = supabase
            .from('ses_demandeObj')
            .select(`
                *,
                users: id_user ( full_name, service ),
                items: ses_demItems ( niv_val, nivrefus ),
                rectifications: ses_rectification ( obj_id )
            `)
            .order('id', { ascending: false })

        if (!(userStore.type_compte == 1 || userStore.achat || userStore.afe ||
              userStore.finance || userStore.dpr || userStore.cheque || userStore.cg)) {
            query = query.eq('id_sup', userStore.id).limit(20)
        }

        const { data, error } = await query
        if (error) throw error

        let dataObj = data.map(item => {
            const nivMin = item.items?.length
                ? Math.min(...item.items.map(it => it.niv_val))
                : null
            return {
                ...item,
                nom_user: item.users?.full_name,
                service: item.users?.service || '-',
                niv_val_min: nivMin,
                date_original: item.date, // important pour le filtre date
                date: formatDate(item.date),
                nb_rectifications: item.rectifications?.length || '-'
            }
        })

        // Filtrage par rôle (optimisé)
        if (userStore.type_compte != 1 || !userStore.cg || !userStore.finance) {
            if (userStore.achat) {
                dataObj = dataObj.filter(d => d.niv_val_min !== null && d.niv_val_min > niveau.achat);

            } else if (userStore.afe) {
                dataObj = dataObj.filter(d => d.niv_val_min !== null && d.niv_val_min > niveau.afe);
                
            } 
            /*else if (userStore.finance) {
                dataObj = dataObj.filter(d => d.niv_val_min !== null && d.niv_val_min > niveau.finance);
                
            } */
            else if (userStore.dpr) {
                dataObj = dataObj.filter(d => d.niv_val_min !== null && d.niv_val_min > niveau.dpr);
                
            } /*else if (userStore.cheque) {
                dataObj = dataObj.filter(d => d.niv_val_min !== null && d.niv_val_min > niveau.cheque && d.niv_val_min !== niveau.refuse);
                
            } */
            /*else if (userStore.cg) {
                dataObj = dataObj.filter(d => d.niv_val_min !== null && d.niv_val_min > niveau.cg);
            }*/
        }

        liste_demande.value = dataObj.map(item => ({
            ...item,
            niv_val:
                item.niv_val_min === niveau.superieur ? 'En attente de validation chez le superieur' :
                item.niv_val_min === niveau.achat ? 'En attente de validation chez le responsable d\'achat' :
                item.niv_val_min === niveau.afe ? 'En attente d\' AFE-BC' :
                item.niv_val_min === niveau.finance ? 'En attente de validation chez le responsable financier' :
                item.niv_val_min === niveau.cg ? 'En attente de validation chez le controlleur de gestion' :
                item.niv_val_min === niveau.dpr ? 'En attente de validation du DPR' :
                item.niv_val_min === niveau.cheque ? 'En attente d\'émission de chèque' :
                item.niv_val_min === niveau.livraison ? 'En attente de livraison' :
                item.niv_val_min === niveau.valide ? 'Validée' :
                item.niv_val_min === niveau.refuse ? 'La demande a été refusée' :
                'Statut inconnu'
        }))
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

// Exportation des demandes //
const exportToExcel = async (filteredRows = []) => {
    try {
        const ids = filteredRows.map(r => r.id).filter(Boolean)

        if (!ids.length) {
            return
        }

        const  { data, error } = await supabase
            .from('ses_demItems')
            .select(`*, fournisseur2(nom), ses_demandeObj(date, nom,id_user(full_name, service))`)
            .in('id_obj', ids)
            .order('id', { ascending: true })

            if (error) throw error;

            console.log('dataExport',data);
            
        const exportData = data.map(item => ({
            'N° d\'Enregistrement': item.id_obj,
            'Date': item.ses_demandeObj ? formatDate(item.ses_demandeObj.date) : '-',
            'Demandeur': item.ses_demandeObj.id_user?.full_name || '-',
            'Service': item.ses_demandeObj.id_user?.service || '-',
            'Objet de la demande': item.ses_demandeObj.nom,
            'Désignation': item.designation,
            'Spécificités techniques': item.spec,
            'Quantité': item.qte,
            'fournisseur possible': item.fournisseur?.nom || '-',
            'prix unitaire': item.prix || '-',
            'Date de livraison souhaitée': item.delai ? formatDate(item.delai) : '-',
            'Total': item.total || '-',
            'Commentaire du demandeur': item.com || '-',
            'Commentaire du supérieur': item.com_sup || '-',
            'Prix Réel': item.prixR || '-',
            'Total Réel': item.totalR || '-',
            'Tiger': item.num_tiger || '-',
            'Fournisseur Réel': item.fournisseur2?.nom || '-',
            'Imputation Analytique': item.imputation || '-',
            'Commentaires': item.com || '-',
            'N° de chèque': item.num_cheque || '-',
            'Date d\'émission de chèque': item.date_emission_cheque ? formatDate(item.date_emission_cheque) : '-',
            'Observation chèque': item.observation_cheque || '-',
            'Observation DPR': item.observation_dpr || '-',
            'date de livraison': item.date_livraison ? formatDate(item.date_livraison) : '-',
            'observation livraison': item.observation_livraison || '-',
            'Commentaire de l\' acheteur': item.com_achat || '-',
            'commentaire de la finance': item.com_fin || '-',
            'commentaire du du contrôleur de gestion': item.com_cg || '-',
            'motif de refus': item.motif || '-',
            'Statut': 
                item.niv_val === niveau.superieur ? 'En attente de validation chez le superieur' :
                item.niv_val === niveau.achat ? 'En attente de validation chez le responsable d\'achat' :
                item.niv_val === niveau.afe ? 'En attente d\' AFE-BC' :
                item.niv_val === niveau.finance ? 'En attente de validation chez le responsable financier' :
                item.niv_val === niveau.cg ? 'En attente de validation chez le controlleur de gestion' :
                item.niv_val === niveau.dpr ? 'En attente de validation du DPR' :
                item.niv_val === niveau.cheque ? 'En attente d\'émission de chèque' :
                item.niv_val === niveau.livraison ? 'En attente de livraison' :
                item.niv_val === niveau.valide ? 'Validée' :
                item.niv_val === niveau.refuse ? 'La demande a été refusée' :
                'Statut inconnu'
        }));

        const nameExcel = 'Les_demandes_achat_';

        await exportExcel(exportData, nameExcel);
        
    } catch (error) {
        console.error('Erreur lors de l\'exportation vers Excel:', error);
        showAlert('Erreur lors de l\'exportation vers Excel.', 'Oops', 'danger');
    }
};

onMounted(() => getDemande())
</script>