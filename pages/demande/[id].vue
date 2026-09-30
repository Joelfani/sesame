<template>
    <div class="purchase_page">
        <!-- Header avec titre, bouton développer/réduire et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE</h1>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-primary" @click="expanded = !expanded">
                    {{ expanded ? 'Réduire le tableau' : 'Développer le tableau' }}
                </button>
                <NuxtLink to="/demande" class="btn btn-outline-secondary">Retour à la liste</NuxtLink>
            </div>
        </div>

        <!-- Informations générales de la demande -->
        <div>
            <h6>N° d'enregistrement: <span>{{ route.params.id }}</span></h6>
            <h6>Date: {{ dataObj.date }}</h6>
            <div class="d-flex align-items-center gap-3">
                <h6>Objet: {{ dataObj.nom }}</h6>
            </div>
        </div>

        <!-- Tableau des détails -->
        <div class="table_block_list mt-4">
            <Table :columns="displayColumns" :rows="demande_details" :showActions="true" :loading="loading">
                <template #actions="{ item }">
                    <div v-if="item.niv_val === niveau.erg" class="d-flex gap-2">
                        <button
                            class="btn btn-outline-primary btn-sm"
                            data-bs-toggle="modal"
                            :data-bs-target="'#modEdit' + item.id"
                            @click="openEditModal(item)"
                        >
                            Modifier
                        </button>
                        <button
                            class="btn btn-outline-success btn-sm"
                            :disabled="sendingId === item.id"
                            @click="envoyerDemande(item)"
                        >
                            Envoyer
                        </button>
                    </div>
                </template>
            </Table>
        </div>

        <!-- Modals d'édition (un par ligne) -->
        <Modal
            v-for="item in demande_details"
            :key="'modEdit' + item.id"
            :id="'modEdit' + item.id"
            title="Modifier la ligne"
        >
            <div v-if="editingId === item.id">
                <div class="mb-3">
                    <label class="form-label">Désignation</label>
                    <textarea v-model="editForm[keyDesignation]" rows="2" class="form-control"></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Nombre</label>
                    <input
                        v-model.number="editForm[keyNombre]"
                        type="number"
                        min="1"
                        class="form-control"
                        @input="recalculerTotal"
                    >
                </div>
                <div class="mb-3">
                    <label class="form-label">Spécificités techniques, les références (à bien préciser)</label>
                    <textarea v-model="editForm[keySpecification]" rows="3" class="form-control"></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label">Fournisseur possible</label>
                    <select v-model="editForm[keyFournisseur]" class="form-control">
                        <option v-for="opt in fournisseurs" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">PU budgété</label>
                    <input
                        v-model.number="editForm[keyPrix]"
                        type="number"
                        min="1"
                        class="form-control"
                        @input="recalculerTotal"
                    >
                </div>
                <div class="mb-3">
                    <label class="form-label">Date de livraison prévue</label>
                    <input
                        v-model="editForm[keyDelai]"
                        type="date"
                        class="form-control"
                        :min="todayISO"
                    >
                    <small v-if="dateError" class="text-danger">{{ dateError }}</small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Montant total du budget alloué</label>
                    <input :value="formattedTotal" type="text" class="form-control" disabled>
                </div>

                <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button
                        class="btn btn-success"
                        :disabled="!!dateError"
                        @click="enregistrerModification(item)"
                    >
                        Enregistrer
                    </button>
                </div>
            </div>
        </Modal>

        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title" />
    </div>
</template>

<script setup>
import { tableTete, niveau } from '~/assets/js/CommonVariable.js';

// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
// Route
const route = useRoute();

// loading
const loading = ref(true);

// ====================== COLONNES ======================
const fullColumns = [
    { key: 'num', label: 'N°' },
    { key: 'etat', label: 'État' },
    { key: 'motif', label: 'Motif de rejet', style: { minWidth: '350px' } },
    ...tableTete.filter(col => col.key !== 'id' && col.key !== 'com' && col.key !== 'motif'),
    { key: 'com', label: 'Commentaire', style: { minWidth: '350px' } },
    { key: 'imputation', label: 'Imputation analytique' },
    { key: 'fournisseur2', label: 'Fournisseur Réel' },
    { key: 'prixR', label: 'Prix Réel' },
    { key: 'totalR', label: 'Montant Réel' },
    { key: 'observation_dpr', label: 'Observation DPR' },
    { key: 'num_cheque', label: 'N° Chèque' },
    { key: 'date_emission_cheque', label: 'Date d\'émission' },
    { key: 'observation_cheque', label: 'Observation Chèque' },
    { key: 'date_livraison', label: 'Date de livraison' },
    { key: 'observation_livraison', label: 'Observation sur la livraison', style: { minWidth: '350px' } },
];

// Libellés de la vue réduite — correspondent aux labels de tableTete
const reducedLabels = [
    'N°',
    'État',
    'Motif de rejet',
    'Désignation',
    'Nombre',
    'Spécificités techniques, les références (à bien préciser)',
    'Fournisseur possible',
    'PU budgeté',
    'Date de livraison prévue',
    'Montant total du budget alloué'
];

const expanded = ref(false); // vue réduite affichée en premier
const reducedColumns = computed(() => fullColumns.filter(c => reducedLabels.includes(c.label)));
const displayColumns = computed(() => expanded.value ? fullColumns : reducedColumns.value);

// Résolution des clés réelles à partir des labels
const findKey = (label) => fullColumns.find(c => c.label === label)?.key;
const keyDesignation = findKey('Désignation');       // designation
const keyNombre = findKey('Nombre');                 // qte
const keySpecification = findKey('Spécificités techniques, les références (à bien préciser)'); // spec
const keyFournisseur = findKey('Fournisseur possible'); // fournisseur
const keyPrix = findKey('PU budgeté');               // prix
const keyDelai = findKey('Date de livraison prévue'); // delai
const keyTotal = findKey('Montant total du budget alloué'); // total

// ====================== DATA ======================
const demande_details = ref([]);
const dataObj = ref([]);
const fournisseurs = ref([]);
const alert = ref({ show: false, message: '', title: '', type: '' });

const showAlert = (message, title, type) => {
    alert.value = { show: true, message, title, type }
    setTimeout(() => { alert.value.show = false }, 5000)
}

const closeModal = (modalId) => {
    const modal = document.getElementById(modalId)
    if (modal) {
        const btn = modal.querySelector('[data-bs-dismiss="modal"]')
        if (btn) btn.click()
    }
}

// ====================== FOURNISSEURS ======================
const listFournisseurs = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_fournisseurs')
            .select('nom,id')
            .eq('etat_del', false)
            .neq('id', 5000)
            .order('nom', { ascending: true });

        if (error) throw error
        fournisseurs.value = data.map(f => ({
            label: f.nom,
            value: f.id
        }));

        fournisseurs.value.push({
            label: "Autre...(Ajouter dans le commentaire pour suggestion)",
            value: 5000
        });
    } catch (error) {
        console.error('Erreur lors du chargement des fournisseurs:', error);
    }
};

// ====================== CHARGEMENT ======================
const getDemandeDetails = async () => {
    loading.value = true;
    try {
        const { data: demandeObj, error: demandeObjError } = await supabase
            .from('ses_demandeObj')
            .select('*')
            .eq('id', route.params.id)
            .single();
        if (demandeObjError) throw demandeObjError;

        if (demandeObj.id_user !== userStore.id) {
            loading.value = false;
            setTimeout(() => { navigateTo('/demande'); }, 500);
            return;
        }

        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date),
        };

        const { data, error } = await supabase
            .from('ses_demItems')
            .select('*,fournisseur(id,nom),fournisseur2(nom)')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true });
        if (error) throw error;

        const allDataView = data.map(item => {
            return {
                ...item,
                etat:item.niv_val === niveau.erg ? 'En attente de votre soumission' : 
                        item.niv_val === niveau.superieur ? 'En attente de validation chez votre superieur' :
                            item.niv_val === niveau.achat ? 'En attente de validation chez le responsable d\'achat' :
                                item.niv_val === niveau.afe ? 'En attente d\' AFE-BC' :
                                    item.niv_val === niveau.finance ? 'En attente de validation chez le responsable financier' :
                                        item.niv_val === niveau.cg ? 'En attente de validation chez le controlleur de gestion' :
                                            item.niv_val === niveau.dpr ? 'En attente de validation du DPR' :
                                                item.niv_val === niveau.cheque ? 'En attente d\'émission de chèque' :
                                                    item.niv_val === niveau.livraison ? 'En attente de livraison' :
                                                        item.niv_val === niveau.valide ? 'Validée' :
                                                            item.niv_val === niveau.refuse ? 'Votre demande a été refusée' :
                                                                'Statut inconnu',
                delai: formatDate(item.delai),
                _delaiRaw: item.delai, // valeur ISO brute pour le formulaire
                _fournisseurIdRaw: item.fournisseur?.id ?? null, // id FK brut pour le formulaire
                fournisseur: item.fournisseur?.nom || '',
                fournisseur2: item.fournisseur2?.nom || '',
            };
        });

        demande_details.value = allDataView;
        loading.value = false;
    } catch (error) {
        console.log(error);
        loading.value = false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

// ====================== ÉDITION ======================
const editingId = ref(null);
const editForm = ref({});

const todayISO = computed(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
});

const dateError = computed(() => {
    if (!editForm.value[keyDelai]) return '';
    return editForm.value[keyDelai] < todayISO.value
        ? 'La date de livraison prévue ne peut pas être antérieure à aujourd\'hui.'
        : '';
});

const formattedTotal = computed(() => {
    const total = (Number(editForm.value[keyNombre]) || 0) * (Number(editForm.value[keyPrix]) || 0);
    return new Intl.NumberFormat('fr-FR').format(total);
});

const recalculerTotal = () => {
    editForm.value[keyTotal] = (Number(editForm.value[keyNombre]) || 0) * (Number(editForm.value[keyPrix]) || 0);
};

const openEditModal = (item) => {
    editingId.value = item.id;
    editForm.value = {
        [keyDesignation]: item[keyDesignation],
        [keyNombre]: item[keyNombre],
        [keySpecification]: item[keySpecification],
        [keyFournisseur]: item._fournisseurIdRaw,
        [keyPrix]: item[keyPrix],
        [keyDelai]: item._delaiRaw,
    };
    recalculerTotal();
};

const enregistrerModification = async (item) => {
    if (dateError.value) return;

    try {
        const total = (Number(editForm.value[keyNombre]) || 0) * (Number(editForm.value[keyPrix]) || 0);
        const updatePayload = {
            [keyDesignation]: editForm.value[keyDesignation],
            [keyNombre]: editForm.value[keyNombre],
            [keySpecification]: editForm.value[keySpecification],
            [keyFournisseur]: editForm.value[keyFournisseur],
            [keyPrix]: editForm.value[keyPrix],
            [keyDelai]: editForm.value[keyDelai],
            [keyTotal]: total,
        };

        const { error } = await supabase
            .from('ses_demItems')
            .update(updatePayload)
            .eq('id', item.id);
        if (error) throw error;

        closeModal('modEdit' + item.id);
        await getDemandeDetails();
        showAlert('Ligne modifiée avec succès', 'Succès', 'success');
    } catch (error) {
        console.error(error);
        showAlert('Erreur lors de la modification', 'Oops', 'danger');
    }
};

// ====================== ENVOI ======================
const sendingId = ref(null);

const envoyerDemande = async (item) => {
    sendingId.value = item.id;
    try {
        const { error } = await supabase
            .from('ses_demItems')
            .update({ niv_val: niveau.erg + 1 })
            .eq('id', item.id);
        if (error) throw error;

        await getDemandeDetails();
        showAlert('Ligne envoyée avec succès', 'Succès', 'success');
    } catch (error) {
        console.error(error);
        showAlert('Erreur lors de l\'envoi', 'Oops', 'danger');
    } finally {
        sendingId.value = null;
    }
};

// LIFECYCLE HOOKS
onMounted(() => {
    getDemandeDetails();
    listFournisseurs();
});
</script>