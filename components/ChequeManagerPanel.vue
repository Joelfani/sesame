<!--
  ChequeManagerPanel.vue

  Panneau réutilisable de gestion des chèques (table ses_chequeList).
  Ce n'est PAS un modal en soi (pas de <div class="modal">) — c'est juste
  le contenu (liste + formulaire), pensé pour être placé :
    1. à l'intérieur d'un modal dédié "Gérer les chèques" pour UNE ligne
       (itemIds = [idItem]) ;
    2. à l'intérieur du modal "Émettre chèque par fournisseur" existant,
       une fois le fournisseur choisi (itemIds = tous les items de ce
       fournisseur) — le même chèque (num + date + montant) est alors
       dupliqué en une ligne ses_chequeList PAR item, avec EXACTEMENT le
       même montant pour chacun (pas de répartition demandée).

  Écriture DIRECTE en base à chaque action : pas de staging (contrairement
  à la page Rectification), et suppression DÉFINITIVE — il n'y a plus de
  flag "annulé" sur les chèques.

  IMPORTANT : ce panneau ne touche JAMAIS à ses_demItems.niv_val — ajouter,
  modifier ou supprimer un chèque ne fait pas avancer la ligne. Seul le
  bouton "Valider" (géré dans le composant parent) avance le niveau, et
  seulement s'il existe au moins un chèque pour l'item concerné.
-->
<template>
    <div class="cheque-manager-panel">
        <!-- Liste des chèques déjà enregistrés pour le(s) item(s) fournis -->
        <div v-if="loading" class="text-center py-3">
            Chargement des chèques...
        </div>
        <div v-else>
            <div v-if="cheques.length === 0" class="text-muted mb-3">
                Aucun chèque enregistré pour le moment.
            </div>

            <table v-else class="table table-sm align-middle">
                <thead>
                    <tr>
                        <th>N° Chèque</th>
                        <th>Date d'émission</th>
                        <th>Montant (Ar)</th>
                        <!-- Colonne affichée seulement en mode multi-items
                             (fournisseur), pour savoir quel item est concerné -->
                        <th v-if="itemIds.length > 1">Article</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="c in cheques" :key="c.id">
                        <!-- Ligne en mode édition -->
                        <template v-if="editingId === c.id">
                            <td>
                                <input v-model="editForm.num_cheque" type="text" class="form-control form-control-sm">
                            </td>
                            <td>
                                <input v-model="editForm.date_emission_cheque" type="date" class="form-control form-control-sm">
                            </td>
                            <td>
                                <input v-model.number="editForm.montant" type="number" min="0" class="form-control form-control-sm">
                            </td>
                            <td v-if="itemIds.length > 1">{{ c.id_item.num }}</td>
                            <td class="d-flex gap-1">
                                <button class="btn btn-success btn-sm" :disabled="savingEdit" @click="saveEdit(c.id)">
                                    {{ savingEdit ? '...' : 'OK' }}
                                </button>
                                <button class="btn btn-outline-secondary btn-sm" @click="cancelEdit">Annuler</button>
                            </td>
                        </template>

                        <!-- Ligne en affichage normal -->
                        <template v-else>
                            <td>{{ c.num_cheque }}</td>
                            <td>{{ c.date_emission_cheque }}</td>
                            <td>{{ formatNumber(c.montant) }}</td>
                            <td v-if="itemIds.length > 1">{{ c.id_item.num }}</td>
                            <td class="d-flex gap-1">
                                <button class="btn btn-outline-primary btn-sm" @click="startEdit(c)">Modifier</button>
                                <button class="btn btn-outline-danger btn-sm" :disabled="deletingId === c.id" @click="removeCheque(c.id)">
                                    {{ deletingId === c.id ? '...' : 'Supprimer' }}
                                </button>
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>

        <hr>

        <!-- Formulaire d'ajout d'un nouveau chèque -->
        <h6 class="fw-bold">
            Ajouter un chèque
        </h6>

        <div v-if="itemIds.length === 0" class="alert alert-warning">
            Aucun article sélectionné — impossible d'ajouter un chèque.
        </div>
        <div v-else class="row g-2 align-items-end">
            <div class="col-md-4">
                <label class="form-label">N° Chèque</label>
                <input v-model="newCheque.num_cheque" type="text" class="form-control form-control-sm" placeholder="Ex: CHQ-00456">
            </div>
            <div class="col-md-4">
                <label class="form-label">Date d'émission</label>
                <input v-model="newCheque.date_emission_cheque" type="date" class="form-control form-control-sm">
            </div>
            <div class="col-md-4">
                <label class="form-label">Montant (Ar)</label>
                <input v-model.number="newCheque.montant" type="number" min="0" class="form-control form-control-sm">
            </div>
            <div class="col-12">
                <button class="btn btn-outline-success btn-sm mt-2" :disabled="addLoading" @click="addCheque">
                    {{ addLoading ? 'Ajout en cours...' : '+ Ajouter ce chèque' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
// `itemIds` : liste des id de ses_demItems concernés par ce panneau.
//   - 1 seul id  -> mode "ligne" (bouton "Gérer chèques" du tableau)
//   - plusieurs  -> mode "fournisseur" (un chèque dupliqué sur chaque item)
const props = defineProps({
    itemIds: { type: Array, required: true },
})

// Émis après chaque écriture réussie, pour que le composant parent
// rafraîchisse ses propres données (ex: compteur "Nb. chèques" du tableau)
const emit = defineEmits(['updated'])

const supabase = useSupabaseClient()
const userStore = useUserStore()

const cheques = ref([])
const loading = ref(false)
const addLoading = ref(false)
const savingEdit = ref(false)
const deletingId = ref(null)
const editingId = ref(null)
const editForm = ref({ num_cheque: '', date_emission_cheque: '', montant: null })
const newCheque = ref({ num_cheque: '', date_emission_cheque: '', montant: null })

// Formatage simple des montants (séparateur de milliers français)
const formatNumber = (n) => (n === null || n === undefined ? '-' : Number(n).toLocaleString('fr-FR'))

// Recharge la liste des chèques existants pour le(s) item(s) courant(s)
const loadCheques = async () => {
    if (!props.itemIds.length) {
        cheques.value = []
        return
    }
    loading.value = true
    try {
        const { data, error } = await supabase
            .from('ses_chequeList')
            .select('*, id_item (num)')
            .in('id_item', props.itemIds)
            .order('created_at', { ascending: true })
        if (error) throw error
        cheques.value = data || []
        console.log('Chèques chargés :', cheques.value)
    } catch (error) {
        console.error('Erreur lors du chargement des chèques:', error)
    } finally {
        loading.value = false
    }
}

const resetNewCheque = () => {
    newCheque.value = { num_cheque: '', date_emission_cheque: '', montant: null }
}

// Ajout : une ligne ses_chequeList PAR id_item fourni, avec les MÊMES
// valeurs (num_cheque, date_emission_cheque, montant) pour chacune —
// c'est ce qui permet au mode "fournisseur" d'affecter le même chèque à
// plusieurs articles en une seule action.
const addCheque = async () => {
    if (!newCheque.value.num_cheque || !newCheque.value.date_emission_cheque || !newCheque.value.montant) {
        alert('Veuillez renseigner le numéro, la date et le montant du chèque.')
        return
    }

    addLoading.value = true
    try {
        const rows = props.itemIds.map((idItem) => ({
            id_item: idItem,
            num_cheque: newCheque.value.num_cheque,
            date_emission_cheque: newCheque.value.date_emission_cheque,
            montant: newCheque.value.montant,
            id_user: userStore.id,
        }))

        const { error } = await supabase.from('ses_chequeList').insert(rows)
        if (error) throw error

        resetNewCheque()
        await loadCheques()
        emit('updated')
    } catch (error) {
        console.error('Erreur lors de l\'ajout du chèque:', error)
        alert('Erreur lors de l\'ajout du chèque.')
    } finally {
        addLoading.value = false
    }
}

const startEdit = (cheque) => {
    editingId.value = cheque.id
    editForm.value = {
        num_cheque: cheque.num_cheque,
        date_emission_cheque: cheque.date_emission_cheque,
        montant: cheque.montant,
    }
}

const cancelEdit = () => {
    editingId.value = null
}

// Modification : écrite immédiatement (pas de staging), ne touche QUE la
// ligne ses_chequeList précise éditée — même en mode fournisseur, chaque
// chèque reste ensuite modifiable/supprimable indépendamment des autres.
const saveEdit = async (chequeId) => {
    if (!editForm.value.num_cheque || !editForm.value.date_emission_cheque || !editForm.value.montant) {
        alert('Veuillez renseigner le numéro, la date et le montant du chèque.')
        return
    }
    savingEdit.value = true
    try {
        const { error } = await supabase
            .from('ses_chequeList')
            .update({ ...editForm.value })
            .eq('id', chequeId)
        if (error) throw error

        editingId.value = null
        await loadCheques()
        emit('updated')
    } catch (error) {
        console.error('Erreur lors de la modification du chèque:', error)
        alert('Erreur lors de la modification du chèque.')
    } finally {
        savingEdit.value = false
    }
}

// Suppression DÉFINITIVE : plus de flag "annulé", la ligne disparaît de
// ses_chequeList. On redemande confirmation car l'action est irréversible.
const removeCheque = async (chequeId) => {
    if (!confirm('Supprimer définitivement ce chèque ? Cette action est irréversible.')) return

    deletingId.value = chequeId
    try {
        const { error } = await supabase.from('ses_chequeList').delete().eq('id', chequeId)
        if (error) throw error

        await loadCheques()
        emit('updated')
    } catch (error) {
        console.error('Erreur lors de la suppression du chèque:', error)
        alert('Erreur lors de la suppression du chèque.')
    } finally {
        deletingId.value = null
    }
}

// Si les items concernés changent (ex: on passe d'une ligne à une autre,
// ou on change de fournisseur sélectionné dans le modal), on recharge la
// liste automatiquement. `immediate: true` pour charger dès le montage.
watch(() => props.itemIds, loadCheques, { immediate: true, deep: true })

// Exposé pour que le parent puisse forcer un rechargement si besoin
// (ex: juste avant d'ouvrir le modal, par sécurité)
defineExpose({ loadCheques })
</script>

<style scoped>
.cheque-manager-panel {
    padding: 4px 0;
}
</style>