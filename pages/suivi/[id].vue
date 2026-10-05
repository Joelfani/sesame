<template>
  <div class="purchase_page">
    <!-- Header avec titre et lien de retour -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>DÉTAILS DE LA DEMANDE</h1>
      <div class="link_demande">
        <NuxtLink to="/suivi" class="btn btn-outline-secondary">Retour à la liste</NuxtLink>
      </div>
    </div>

    <!-- Informations générales de la demande -->
    <div class="row">
      <div class="col-8">
        <h6>N° d'enregistrement: <span>{{ route.params.id }}</span></h6>
        <h6>Date: <span>{{ dataObj.date }}</span></h6>

        <div class="d-flex align-items-center gap-3">
          <h6>Objet: <span>{{ dataObj.nom }}</span></h6>
        </div>
      </div>
      <div
        class="col-4"
        style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
        "
      >
        <h6>Total Budgété: <strong>{{ totalAmount }} Ar</strong></h6>
        <h6>Total Réel: <strong>{{ totalAmountR }} Ar</strong></h6>
      </div>
    </div>

    <!-- Tableau des détails -->
    <div class="table_block_list mt-4">
      <Table
        :columns="columns"
        :rows="demande_details"
        :showActions="true"
        :loading="loading"
      >
        <template #actions="{ item }">
          <button
            class="btn btn-outline-dark btn-sm"
            data-bs-toggle="modal"
            :data-bs-target="'#modCheques' + item.id"
            @click="chargerCheques(item)"
          >
            Voir chèques
          </button>
        </template>
      </Table>
    </div>

    <!-- Modals des chèques par ligne (tous les chèques via ses_chequeList) -->
    <Modal
      v-for="item in demande_details"
      :key="'modCheques' + item.id"
      :id="'modCheques' + item.id"
      title="Chèques affectés à cette ligne"
    >
      <div v-if="loadingCheques" class="text-center text-muted py-3">
        Chargement...
      </div>
      <div v-else>
        <!-- Tous les chèques viennent de ses_chequeList -->
        <div v-if="chequesSelectionnes.length === 0" class="text-muted">
          Aucun chèque pour cette ligne.
        </div>

        <div
          v-for="cheque in chequesSelectionnes"
          :key="cheque.id"
          class="border rounded p-3 mb-2"
          :class="{ 'bg-light': cheque.annule }"
        >
          <strong>{{ cheque.num_cheque }}</strong>
          — {{ cheque.date_emission_cheque }}
          <span v-if="cheque.montant">
            — {{ formatNumber(cheque.montant) }} Ar
          </span>
          <span v-if="cheque.annule" class="badge bg-secondary ms-2">
            Annulé
          </span>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { tableTete, niveau } from '~/assets/js/CommonVariable.js';

// Services
const supabase = useSupabaseClient();

// Store
const userStore = useUserStore();

// Route
const route = useRoute();

// Loading
const loading = ref(true);

// Définition des colonnes du tableau
const columns = [
  { key: 'num', label: 'N°' },
  { key: 'etat', label: 'État' },
  {
    key: 'motif',
    label: 'Motif de rejet ',
    style: { minWidth: '350px' },
  },
  {
    key: 'rejeteur',
    label: 'Rejeté par',
    style: { minWidth: '350px' },
  },
  ...tableTete.filter(
    (col) =>
      col.key !== 'id' &&
      col.key !== 'com' &&
      col.key !== 'motif' &&
      col.key !== 'num_tiger'
  ),
  { key: 'imputation', label: 'Imputation analytique' },
  { key: 'imputation_old', label: 'Ancienne Imputation' },
  { key: 'num_tiger', label: 'Tiger' },
  {
    key: 'com',
    label: 'Commentaire',
    style: { minWidth: '350px' },
  },
  { key: 'fournisseur2', label: 'Fournisseur Réel' },
  { key: 'prixR', label: 'Prix Réel' },
  { key: 'totalR', label: 'Montant Réel' },
  { key: 'observation_dpr', label: 'Observation DPR' },
  // Colonnes chèque : on retire num_cheque et date_emission_cheque
  { key: 'nb_cheques', label: 'Nb. chèques' },
  {
    key: 'observation_cheque',
    label: 'Observation Chèque',
  },
  { key: 'date_livraison', label: 'Date de livraison' },
  {
    key: 'observation_livraison',
    label: 'Observation sur la livraison',
    style: { minWidth: '350px' },
  },
];

// DATA
const demande_details = ref([]);
const dataObj = ref([]);
const chequesSelectionnes = ref([]);
const loadingCheques = ref(false);

// METHODES
const getDemandeDetails = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('ses_demItems')
      .select('*, fournisseur(nom), fournisseur2(nom), user_refuse(full_name)')
      .eq('id_obj', route.params.id)
      .order('num', { ascending: true });

    if (error) throw error;

    // Récupérer le nombre de chèques par article (ses_chequeList)
    const itemIds = data.map((item) => item.id);
    let chequeCountMap = {};

    if (itemIds.length > 0) {
      const { data: chequeRows, error: chequeErr } = await supabase
        .from('ses_chequeList')
        .select('id_item')
        .in('id_item', itemIds);

      if (chequeErr) throw chequeErr;

      (chequeRows || []).forEach((row) => {
        chequeCountMap[row.id_item] = (chequeCountMap[row.id_item] || 0) + 1;
      });
    }

    const allDataView = data.map((item) => {
      return {
        ...item,
        etat:
          item.niv_val === niveau.erg
            ? 'En attente de soumission de la ligne'
            : item.niv_val === niveau.superieur
            ? 'En attente de validation chez votre superieur'
            : item.niv_val === niveau.achat
            ? 'En attente de validation chez le responsable d\'achat'
            : item.niv_val === niveau.afe
            ? 'En attente de validation chez le responsable administratif d\'achat'
            : item.niv_val === niveau.finance
            ? 'En attente de validation chez le responsable financier'
            : item.niv_val === niveau.cg
            ? 'En attente de validation chez le controlleur de gestion'
            : item.niv_val === niveau.dpr
            ? 'En attente de validation du DPR'
            : item.niv_val === niveau.cheque
            ? 'En attente d\'émission de chèque'
            : item.niv_val === niveau.livraison
            ? 'En attente de livraison'
            : item.niv_val === niveau.valide
            ? 'Validée'
            : item.niv_val === niveau.refuse
            ? 'Demande refusée'
            : 'Erreur',
        delai: formatDate(item.delai),
        fournisseur: item.fournisseur?.nom || '',
        fournisseur2: item.fournisseur2?.nom || '',
        rejeteur: item.user_refuse?.full_name || '',
        nb_cheques: chequeCountMap[item.id] || 0,
      };
    });

    demande_details.value = allDataView;

    // Recuperation des informations de l'objet
    const { data: demandeObj, error: demandeObjError } = await supabase
      .from('ses_demandeObj')
      .select('*')
      .eq('id', route.params.id)
      .single();

    if (demandeObjError) throw demandeObjError;

    dataObj.value = {
      ...demandeObj,
      date: formatDate(demandeObj.date),
    };

    loading.value = false;
  } catch (error) {
    console.log(error);
  }
};

// Chargement des chèques (ses_chequeList) pour une ligne donnée
const chargerCheques = async (item) => {
  loadingCheques.value = true;
  chequesSelectionnes.value = [];
  try {
    const { data, error } = await supabase
      .from('ses_chequeList')
      .select('*')
      .eq('id_item', item.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    chequesSelectionnes.value = data || [];
  } catch (error) {
    console.log('Erreur lors de la récupération des chèques', error);
  } finally {
    loadingCheques.value = false;
  }
};

// Formatage des nombres avec virgule et espace
const toNumber = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(val.toString().replace(/\s/g, '').replace(',', '.')) || 0;
};

// Formatage du montant avec séparateur de milliers
const formatMontant = (val) => {
  const nombre = toNumber(val);
  return new Intl.NumberFormat('fr-FR').format(nombre);
};

const formatNumber = (n) => {
  if (n === null || n === undefined) return '-';
  return Number(n).toLocaleString('fr-FR');
};

// Total brut (nombre)
const totalAmount = computed(() => {
  return formatMontant(
    demande_details.value
      .filter((item) => item.etat !== 2)
      .reduce((total, item) => {
        return total + toNumber(item.qte) * toNumber(item.prix);
      }, 0)
  );
});

// Total pour prixR
const totalAmountR = computed(() => {
  return formatMontant(
    demande_details.value
      .filter((item) => item.etat !== 2)
      .reduce((total, item) => {
        return total + toNumber(item.qte) * toNumber(item.prixR);
      }, 0)
  );
});

// Formatage de la date
const formatDate = (dateString) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

// LIFECYCLE HOOKS
onMounted(() => {
  getDemandeDetails();
});
</script>