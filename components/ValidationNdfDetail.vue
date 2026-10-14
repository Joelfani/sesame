<!-- components/ValidationNdfDetail.vue -->
<template>
    <div class="purchase_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>{{ titre }}</h1>

            <div class="d-flex gap-2">
                <button class="btn btn-outline-success" @click="exportToExcel">
                    Exporter vers Excel
                </button>
                <button
                    v-if="enableAfe"
                    class="btn btn-outline-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#afeNdf"
                >
                    A.F.E
                </button>
                <button
                    v-if="massValidation?.enabled"
                    class="btn btn-outline-secondary"
                    data-bs-toggle="modal"
                    data-bs-target="#valMasse"
                    @click="initMassData"
                >
                    Validation en masse
                </button>
                <button
                    class="btn btn-outline-dark"
                    data-bs-toggle="modal"
                    data-bs-target="#modDocNdf"
                    @click="doc_recovery"
                >
                    Liste des documents
                </button>
                <NuxtLink
                    v-if="retourPath"
                    :to="retourPath"
                    class="btn btn-outline-secondary"
                >
                    Retour à la liste
                </NuxtLink>
            </div>
        </div>

        <!-- Informations générales -->
        <div class="row mb-3">
            <div class="col-8">
                <h6>N° d'enregistrement : <span>{{ route.params.id }}</span></h6>
                <h6>Date : <span>{{ dataObj.date }}</span></h6>
                <h6>Demandeur : <strong>{{ dataObj.demandeur }}</strong></h6>
            </div>
            <div class="col-4 d-flex flex-column justify-content-center align-items-end">
                <h6>Total : <strong>{{ totalAmount }} Ar</strong></h6>
            </div>
        </div>

        <!-- Tableau -->
        <div class="table_block_list">
            <Table
                ref="tableRef"
                :columns="computedColumns"
                :rows="demande_details"
                :type_but_modal="true"
                :but_Validation="true"
                :actions="tableActions"
                @validation_action="handleValidationAction"
                @editable_field_change="handleEditableFieldChange"
                :loading="loading"
            />
        </div>

        <!-- Alert -->
        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />

        <!-- Modal validation en masse -->
        <Modal
            v-if="massValidation?.enabled"
            id="valMasse"
            :title="massValidation.title || 'Validation en masse'"
        >
            <div class="mb-3">
                <div
                    v-for="field in massValidation.fields"
                    :key="field.key"
                    class="mb-3"
                >
                    <label class="form-label fw-bold">
                        {{ field.label }}
                        <span v-if="field.required" class="text-danger">*</span>
                    </label>

                    <select
                        v-if="field.type === 'select'"
                        v-model="massForm[field.key]"
                        class="form-select"
                    >
                        <option value="">-- Sélectionner --</option>
                        <option
                            v-for="opt in field.options || []"
                            :key="opt.value"
                            :value="opt.value"
                        >
                            {{ opt.label }}
                        </option>
                    </select>

                    <textarea
                        v-else-if="field.type === 'textarea'"
                        v-model="massForm[field.key]"
                        class="form-control"
                        rows="3"
                        :placeholder="field.placeholder || ''"
                    ></textarea>

                    <input
                        v-else
                        v-model="massForm[field.key]"
                        class="form-control"
                        :type="field.type || 'text'"
                        :placeholder="field.placeholder || ''"
                    >
                </div>

                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        Annuler
                    </button>
                    <button
                        class="btn btn-outline-success"
                        @click="validerEnMasse"
                        :disabled="loadingAction"
                    >
                        Valider
                    </button>
                </div>
            </div>
        </Modal>

        <!-- Modal documents -->
        <Modal id="modDocNdf" title="Documents associés à la note de frais">
            <div class="text-center">
                <div v-if="doc_ndf.length === 0" class="text-muted py-3">
                    Aucun document associé à cette note de frais.
                </div>

                <div v-else>
                    <p
                        v-for="doc in doc_ndf"
                        :key="doc.id"
                        class="d-flex justify-content-between align-items-center border-bottom py-2"
                    >
                        <span style="font-weight: bold;">{{ doc.name_doc }}</span>
                        <button
                            class="btn btn-outline-secondary btn-sm"
                            @click="downloadFile(doc.name_doc, doc.nameStorage)"
                            title="Télécharger"
                        >
                            <img
                                src="/public/icon/download.png"
                                style="width: 20px; height: 20px;"
                                alt="Télécharger"
                            >
                        </button>
                    </p>
                </div>
            </div>
        </Modal>
        <!-- Bouton caché pour ouvrir le modal d'édition -->
        <button
            ref="btnOpenEditModal"
            type="button"
            class="d-none"
            data-bs-toggle="modal"
            data-bs-target="#modalEditNdfLigne"
        ></button>
        <!-- Modal édition ligne -->
        <Modal id="modalEditNdfLigne" :title="editModalTitle">
            <div class="row g-3">
                <div
                    v-for="field in editFields"
                    :key="field.key"
                    class="col-12"
                >
                    <label class="form-label fw-bold">
                        {{ field.label }}
                        <span v-if="field.required" class="text-danger">*</span>
                    </label>

                    <select
                        v-if="field.type === 'select'"
                        v-model="editForm[field.key]"
                        class="form-select"
                    >
                        <option value="">-- Sélectionner --</option>
                        <option
                            v-for="opt in (field.options || (field.key === 'imputation' ? imputationOptions : []))"
                            :key="opt.value"
                            :value="opt.value"
                        >
                            {{ opt.label }}
                        </option>
                    </select>

                    <textarea
                        v-else-if="field.type === 'textarea'"
                        v-model="editForm[field.key]"
                        class="form-control"
                        rows="3"
                    ></textarea>

                    <input
                        v-else
                        v-model="editForm[field.key]"
                        class="form-control"
                        :type="field.type || 'text'"
                    >
                </div>
            </div>
            <div class="d-flex gap-2 justify-content-end mt-4 mb-4">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Annuler
                </button>
                <button
                    class="btn btn-primary"
                    :disabled="loadingAction"
                    @click="saveEditLine"
                >
                    Enregistrer
                </button>
            </div>
        </Modal>
                <!-- Bouton caché motif retour -->
        <button
            ref="btnOpenReturnModal"
            type="button"
            class="d-none"
            data-bs-toggle="modal"
            data-bs-target="#modalRetourNdf"
        ></button>

        <!-- Modal motif de retour -->
        <Modal id="modalRetourNdf" title="Motif de retour">
            <div class="mb-3">
                <label class="form-label fw-bold">
                    Motif du retour
                    <span class="text-danger">*</span>
                </label>
                <textarea
                    v-model="returnMotif"
                    class="form-control"
                    rows="4"
                    placeholder="Indiquez le motif du retour..."
                ></textarea>
            </div>
            <div class="d-flex gap-2 justify-content-end mb-2">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Annuler
                </button>
                <button
                    class="btn btn-outline-primary"
                    :disabled="loadingAction"
                    @click="confirmReturn"
                >
                    Confirmer le retour
                </button>
            </div>
        </Modal>

        <!-- Modal AFE NDF -->
        <Modal v-if="enableAfe" id="afeNdf" title="Autorisation formelle d'engagement">
            <div class="pdf-content">
                <p class="mb-2">
                    Génération d'une AFE pour la note de frais n°{{ route.params.id }}.
                </p>
                <hr>
                <span v-if="pdfButtonLoading">Traitement ...</span>
                <button
                    class="btn btn-outline-dark"
                    :disabled="pdfButtonLoading"
                    @click="generateAfeNdf"
                >
                    Générer un AFE
                </button>
                <button class="btn btn-light" data-bs-dismiss="modal">Fermer</button>
            </div>
        </Modal>

        <!-- Contenu PDF caché AFE NDF -->
        <div v-if="enableAfe && pdfAfeReady" style="position: absolute; left: -9999px; top: 0;">
            <div id="pdfafeNdf" style="width: 794px; padding: 30px; background: white; font-size: 10pt;">
                <div class="d-flex justify-content-between align-items-start" style="margin-bottom: 15px;">
                    <img src="/logo.png" style="width: 80px; height: 75px;">
                    <div style="text-align: right; flex: 1; margin-left: 20px;">
                        <p style="font-size: 11pt; margin: 0;">
                            Association PROMotion Economique et Sociale (PROMES)
                        </p>
                    </div>
                </div>

                <div style="text-align: center; margin: 15px 0;">
                    <h4 style="font-weight: bold; font-size: 14pt; margin: 0;">
                        AUTORISATION FORMELLE D'ENGAGEMENT (AFE)
                    </h4>
                </div>

                <div style="display: flex; justify-content: space-between; margin: 12px 0; padding: 0 10px;">
                    <div>
                        <span>Date :</span>
                        <span style="border-bottom: 1px solid #000; display: inline-block; min-width: 150px; padding: 2px 5px;">
                            {{ afeDate }}
                        </span>
                    </div>
                    <div style="text-align: right;">
                        <span>Demandeur :</span>
                        <span style="border-bottom: 1px solid #000; display: inline-block; min-width: 180px; padding: 2px 5px;">
                            {{ dataObj.demandeur }}
                        </span>
                    </div>
                </div>

                <div style="margin: 15px 0; padding: 0 10px;">
                    <span>Objet :</span>
                    <span style="border-bottom: 1px solid #000; display: inline-block; width: calc(100% - 60px); padding: 2px 5px;">
                        Note de frais n°{{ route.params.id }}
                    </span>
                </div>

                <div style="margin: 15px 0; padding: 0 10px; text-align: right;">
                    <span style="font-weight: bold; margin-right: 20px;">Total :</span>
                    <span style="border: 1px solid #000; padding: 5px 15px; min-width: 150px; font-weight: bold;">
                        {{ afeTotalFormatted }} Ar
                    </span>
                </div>

                <!-- Affectations (imputations) -->
                <div style="margin: 15px 0; padding: 0 10px;">
                    <p style="font-weight: bold; margin-bottom: 5px;">Affectation</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <div
                            v-for="(imp, idx) in afeImputations"
                            :key="idx"
                            class="d-flex align-items-center"
                        >
                            <input type="checkbox" style="margin-right: 5px; width: 12px; height: 12px;" checked disabled>
                            <span style="font-size: 9pt;">{{ imp }}</span>
                        </div>
                    </div>
                </div>

                <div style="margin: 10px 0;">
                    <p style=" font-size: 9pt; margin-bottom: 5px; padding: 0 10px;">
                        0 Ar à 1 000 000 Ar (Facture, BC, BL, DA, 1Devis ou proforma) <br>
                        1 000 001 Ar à 5 000 000 Ar (Facture, BC, BL, DA, 3Devis ou proforma, Tableau comparatif) <br>
                        5 000 001 Ar à 16 000 000 Ar (Facture, BC, BL, DA, 4Devis ou proforma, Tableau comparatif) <br>
                        > 16 000 000 Ar (Appel d'offre national ou international, 3 Devis, Facture, BC, BL, DA, Tableau comparatif)
                    </p>
                    <div class="table-responsive" style="margin-top: 10px;">
                        <table class="table table-bordered" style="width: 100%; font-size: 9pt; border: 1px solid #000;">
                            <thead>
                                <tr>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: center;"></th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: center;">Fournisseur</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: center;">Analyse de l'offre</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: center;">Montant</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="border: 1px solid #000; padding: 5px;">Devis 1</td>
                                    <td style="border: 1px solid #000; padding: 5px;"></td>
                                    <td style="border: 1px solid #000; padding: 5px;"></td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #000; padding: 5px;">Devis 2</td>
                                    <td style="border: 1px solid #000; padding: 5px;"></td>
                                    <td style="border: 1px solid #000; padding: 5px;"></td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #000; padding: 5px;">Devis 3</td>
                                    <td style="border: 1px solid #000; padding: 5px;"></td>
                                    <td style="border: 1px solid #000; padding: 5px;"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style="margin: 10px 0 15px 10px;">
                    <p style="font-weight: bold; margin-bottom: 30px;">Le Responsable du Programme</p>
                    <p style="margin-top: 40px;">Nom et Date</p>
                </div>

                <div style="border-top: 2px solid #000; margin: 15px 0;"></div>

                <div style="text-align: right; margin: 10px 10px 15px 0; font-size: 8pt;">
                    <p style="margin: 0;">Association PROMES / Programme SESAME</p>
                </div>

                <!-- Pièce d'écritures (même structure que l'achat) -->
                <div style="margin-top: 15px;">
                    <div style="text-align: center; margin-bottom: 10px;">
                        <h5 style="font-weight: bold; font-size: 12pt; margin: 0;">PIECE D'ECRITURES</h5>
                    </div>
                    <table class="table table-bordered" style="width: 100%; font-size: 9pt; border: 1px solid #000;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #000; padding: 5px; width: 50%;">Journal:</th>
                                <th style="border: 1px solid #000; padding: 5px; width: 50%;">N° de Pièce:</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #000; padding: 5px;">Date:</td>
                                <td style="border: 1px solid #000; padding: 5px;">Emetteur:</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="margin: 10px 0; padding: 0 10px; font-size: 9pt;">
                        <p style="margin: 3px 0;"><strong>COMPTE GENERAL DEBIT:</strong> <span style="border: 1px solid #000; display: inline-block; width: 70%; height: 28px;"></span></p>
                        <p style="margin: 3px 0;"><strong>SECTION ANALYTIQUE:</strong> <span style="border: 1px solid #000; display: inline-block; width: 70%; height: 28px;"></span></p>
                        <p style="margin: 3px 0;"><strong>COMPTE GENERAL CREDIT:</strong> <span style="border: 1px solid #000; display: inline-block; width: 70%; height: 28px;"></span></p>
                        <p style="margin: 3px 0;"><strong>MONTANT (Ar):</strong> <span style="border: 1px solid #000; display: inline-block; width: 70%; height: 28px;"></span></p>
                        <p style="margin: 3px 0;"><strong>LIBELLE:</strong> <span style="border: 1px solid #000; display: inline-block; width: 70%; height: 28px;"></span></p>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 15px; padding: 0 10px;">
                        <div style="flex: 1;">
                            <p style="font-weight: bold; margin-bottom: 30px; font-size: 9pt;">Le Comptable</p>
                            <p style="margin-top: 40px; font-size: 9pt;">Nom et Date</p>
                        </div>
                        <div style="flex: 1; text-align: right;">
                            <p style="font-weight: bold; margin-bottom: 30px; font-size: 9pt;">Le Responsable Administratif et Financier</p>
                            <p style="margin-top: 40px; font-size: 9pt;">Nom et Date</p>
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-between" style="margin-top: 10px; font-size: 7pt; color: #666;">
                    <span>Formulaire PROMES-SESAME</span>
                    <span>Autorisation Formelle d'Engagement Pièce Comptable</span>
                    <span>NDF n°{{ route.params.id }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { niveauNDF } from '~/assets/js/CommonVariable.js'
import { exportExcel } from '~/assets/js/export.js'

// ====================== PROPS ======================
const props = defineProps({
    // Titre de la page
    titre: {
        type: String,
        default: 'VALIDATION DE LA NOTE DE FRAIS'
    },
    // Niveau actuel du validateur
    niveau: {
        type: [Number, String],
        required: true
    },
    // Niveau suivant après validation (défaut = niveau + 1)
    nextLevel: {
        type: [Number, String],
        default: null
    },
    // Chemin de retour
    retourPath: {
        type: String,
        default: ''
    },
    /**
     * Colonnes du tableau
     * Exemple :
     * [
     *   { key: 'num', label: 'N°' },
     *   { key: 'description', label: 'Libellé' },
     *   { key: 'montant', label: 'Montant' },
     *   { key: 'imputation', label: 'Imputation', editable: true, type: 'select', required: true, options: [...] },
     *   { key: 'motif', label: 'Motif de rejet', editable: true, type: 'textarea' },
     *   { key: 'com_sup', label: 'Commentaire', editable: true, type: 'textarea' },
     * ]
     */
    columns: {
        type: Array,
        required: true
    },
    /**
     * Actions disponibles sur chaque ligne
     * Exemple :
     * [
     *   { label: 'Valider', color: 'success', type: 'validate' },
     *   { label: 'Rejeter', color: 'danger', type: 'reject', requireMotif: true },
     *   { label: 'Retourner', color: 'warning', type: 'return', targetLevel: niveauNDF.erg },
     * ]
     */
    actions: {
        type: Array,
        default: () => [
            { label: 'Valider', color: 'success', type: 'validate' },
            { label: 'Rejeter', color: 'secondary', type: 'reject', requireMotif: true }
        ]
    },
    /**
     * Config validation en masse
     * {
     *   enabled: true,
     *   title: 'Validation en masse',
     *   fields: [
     *     { key: 'imputation', label: 'Imputation', type: 'select', required: true, options: [...] },
     *     { key: 'com_sup', label: 'Commentaire', type: 'textarea' }
     *   ]
     * }
     */
    massValidation: {
        type: Object,
        default: () => ({ enabled: false, fields: [] })
    },
    /**
     * Colonnes pour l'export Excel (toutes les colonnes possibles du process)
     * [{ key: 'num', label: 'N°' }, { key: 'imputation', label: 'Imputation' }, ...]
     */
    exportColumns: {
        type: Array,
        default: () => [
            { key: 'num', label: 'N°' },
            { key: 'description', label: 'Libellé' },
            { key: 'nature', label: 'Nature' },
            { key: 'montant', label: 'Montant' },
            { key: 'imputation', label: 'Imputation' },
            { key: 'tiger', label: 'Code Tiger' },
            { key: 'cheque', label: 'N° chèque' },
            { key: 'emission', label: 'Date d\émission' },
            { key: 'motif', label: 'Motif de rejet' },
            { key: 'com_sup', label: 'Commentaire supérieur' },
            { key: 'com_fin', label: 'Commentaire finance' },
            { key: 'com_cg', label: 'Commentaire CG' },
            { key: 'com_dpr', label: 'Commentaire DPR' },
            { key: 'com_cheque', label: 'Commentaire chèque' },
            { key: 'niv_val', label: 'Statut' }
        ]
    },
    // Si true, vérifie que id_sup === userStore.id
    checkSup: {
        type: Boolean,
        default: false
    },
    // Si true, affiche le bouton AFE (pour le niveau Cheque)
    enableAfe: { type: Boolean, default: false }
})

// ====================== SERVICES ======================
const supabase = useSupabaseClient()
const userStore = useUserStore()
const route = useRoute()

// ====================== STATE ======================
const loading = ref(true)
const loadingAction = ref(false)
const tableRef = ref(null)
const dataObj = ref({})
const demande_details = ref([])
const massForm = ref({})
const imputationOptions = ref([])
const doc_ndf = ref([])
const KeySaveOldValue = ref()
const ancienImputation = ref(null)
const editForm = ref({})
const editFields = ref([])
const editItem = ref(null)
const editConfig = ref(null)
const editModalTitle = ref('Modifier la ligne')
const type =ref('valider')
const btnOpenReturnModal = ref(null)
const returnMotif = ref('')
const pendingReturn = ref(null) // { item, fields, config }
// Alert
const alert = ref({ show: false, message: '', title: '', type: '' })
const showAlert = (message, title, type) => {
    alert.value = { show: true, message, title, type }
    setTimeout(() => { alert.value.show = false }, 5000)
}

// ====================== COMPUTED ======================
const resolvedNextLevel = computed(() => {
    return props.nextLevel !== null && props.nextLevel !== undefined
        ? props.nextLevel
        : Number(props.niveau) + 1
})

// Actions pour le composant Table (label + color uniquement)
const tableActions = computed(() =>
    props.actions.map(a => ({ label: a.label, color: a.color }))
)

// Colonnes avec options d'imputation injectées si besoin
const computedColumns = computed(() => {
    return props.columns.map(col => {
        if (col.key === 'imputation' && col.type === 'select' && !col.options) {
            return { ...col, options: imputationOptions.value }
        }
        return col
    })    
})
// Total = somme des montants (hors lignes refusées)
const totalAmount = computed(() => {
    const total = demande_details.value
        .filter(item => item.etat !== 2)
        .reduce((sum, item) => sum + (Number(item.montant) || 0), 0)
    return new Intl.NumberFormat('fr-FR').format(total)
})

// ====================== HELPERS ======================
const closeModal = (modalId) => {
    const modal = document.getElementById(modalId)
    if (modal) {
        const btn = modal.querySelector('[data-bs-dismiss="modal"]')
        if (btn) btn.click()
    }
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

const getActionConfig = (label) => {
    return props.actions.find(a => a.label === label) || null
}

// Champs required définis dans columns
const getRequiredKeys = () => {
    return props.columns
        .filter(c => c.required && c.editable)
        .map(c => c.key)
}

// ====================== DATA LOADING ======================
const listImputation = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_imputation')
            .select('*')
            .eq('etat_del', false)
            .order('nom', { ascending: true })

        if (error) throw error

        imputationOptions.value = (data || []).map(imp => ({
            label: imp.nom,
            value: imp.id // id car clé étrangère (adapte en imp.nom si besoin)
        }))
    } catch (error) {
        console.error('Erreur chargement imputations:', error)
    }
}

const getDemandeDetails = async () => {
    loading.value = true
    try {
        const { data: demandeObj, error: demandeObjError } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name )
            `)
            .eq('id', route.params.id)
            .eq('cat_proc', 'ndf')
            .single()

        if (demandeObjError) throw demandeObjError

        // Contrôle supérieur si demandé
        if (props.checkSup && demandeObj.id_sup !== userStore.id) {
            loading.value = false
            setTimeout(() => {
                if (props.retourPath) navigateTo(props.retourPath)
            }, 400)
            return
        }

        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date),
            demandeur: demandeObj.users?.full_name || 'Nom non trouvé'
        }

        const { data, error } = await supabase
            .from('ses_items_ndf')
            .select('*')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true })

        if (error) throw error

        demande_details.value = (data || []).map(item => ({
            ...item,
            date: formatDate(item.date),
            // 0 = à valider à ce niveau, 2 = refusé, 1 = déjà traité / autre niveau, 4 = pas encore au niveau 
            etat:
                Number(item.niv_val) === Number(props.niveau) ? 0 :
                Number(item.niv_val) === Number(niveauNDF.refuse) ? 2 : 
                Number(item.niv_val) < Number(props.niveau) ? 4 : 1
            
        }))
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du chargement de la note de frais', 'Oops', 'danger')
    } finally {
        loading.value = false
    }
}

// ====================== VALIDATION LIGNE ======================
const handleValidationAction = async ({ action, item, editableData }) => {
    const config = getActionConfig(action)
    if (!config) return

    // Uniquement les lignes au niveau actuel
    if (Number(item.niv_val) !== Number(props.niveau)) {
        showAlert('Cet article n\'est pas en attente à votre niveau.', 'Oops', 'danger')
        return
    }

    if (config.type === 'validate') {
        await doValidate(item, editableData?.fields || {})
    } else if (config.type === 'reject') {
        await doReject(item, editableData?.fields || {}, config)
    } else if (config.type === 'return') {
        const fields = editableData?.fields || {}
        if (config.requireMotif) {
            pendingReturn.value = { item, fields, config }
            returnMotif.value = ''
            nextTick(() => btnOpenReturnModal.value?.click())
        } else {
            await doReturn(item, fields, config, null)
        }
    } else if (config.type === 'edit') {
            openEditModal(item, config)
        }
}

const doValidate = async (item, fields) => {
    // Vérifier les champs required
    const requiredKeys = getRequiredKeys()
    for (const key of requiredKeys) {
        const val = fields[key] ?? item[key]
        if (val === undefined || val === null || val === '') {
            const col = props.columns.find(c => c.key === key)
            showAlert(
                `Le champ « ${col?.label || key} » est obligatoire pour valider.`,
                'Oops',
                'danger'
            )
            return
        }
    }

    // Nettoyage générique : exclut les champs select vides (souvent des FK numériques)
    const fieldsClean = {}
    for (const key in fields) {
        const val = fields[key]
        const colDef = props.columns.find(c => c.key === key)

        if (colDef?.type === 'select' && val === '') {
            continue // on ne l'envoie pas, pour ne pas écraser avec une valeur invalide
        }

        fieldsClean[key] = val
    }

    try {
        const itemToValidate = demande_details.value.filter(Val => Val.id === item.id)
        if (props.niveau === niveauNDF.cg) {
            ancienImputation.value = itemToValidate[0].imputation != item.imputation ? itemToValidate[0].imputation : null
        }

        const updateData = {
            niv_val: resolvedNextLevel.value,
            imputationOld: ancienImputation.value ? ancienImputation.value : itemToValidate[0].imputationOld,
            ...fieldsClean
        }

        const { error } = await supabase
            .from('ses_items_ndf')
            .update(updateData)
            .eq('id', item.id)

        if (error) throw error

        if (resolvedNextLevel.value === niveauNDF.cheque){
            type.value = 'fin'
        }
        else{
            type.value = 'valider'
        }
        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: item.id,
            action: `Validation de l'article ${item.num} de la NDF n°${route.params.id}`,
            niv_val: resolvedNextLevel.value,
            cat_proc: 'ndf',
            type: type.value
        })

        await getDemandeDetails()
        showAlert('Article validé avec succès', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de la validation', 'Oops', 'danger')
    }
}

const doReject = async (item, fields, config) => {
    const motif = fields.motif ?? item.motif
    if (config.requireMotif !== false && (!motif || !String(motif).trim())) {
        showAlert('Veuillez indiquer un motif de rejet.', 'Oops', 'danger')
        return
    }

    try {
        const updateData = {
            niv_val: niveauNDF.refuse,
            motif: motif || null,
            ...fields
        }

        const { error } = await supabase
            .from('ses_items_ndf')
            .update(updateData)
            .eq('id', item.id)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: item.id,
            action: `Rejet de l'article ${item.num} de la NDF n°${route.params.id} - Motif: ${motif}`,
            niv_val: niveauNDF.refuse,
            cat_proc: 'ndf',
            type: 'rejet'
        })

        await getDemandeDetails()
        showAlert('Article rejeté', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du rejet', 'Oops', 'danger')
    }
}

const confirmReturn = async () => {
    if (!pendingReturn.value) return

    const motif = (returnMotif.value || '').trim()
    if (!motif) {
        showAlert('Veuillez indiquer un motif de retour.', 'Oops', 'danger')
        return
    }

    const { item, fields, config } = pendingReturn.value
    await doReturn(item, { ...fields, motif }, config)

    closeModal('modalRetourNdf')
    pendingReturn.value = null
    returnMotif.value = ''
}

const doReturn = async (item, fields, config) => {
    const target = config.targetLevel
    if (target === undefined || target === null) {
        showAlert('Niveau de retour non configuré.', 'Oops', 'danger')
        return
    }

    const motif = fields.motif ?? item.motif
    if (config.requireMotif && (!motif || !String(motif).trim())) {
        showAlert('Veuillez indiquer un motif de retour.', 'Oops', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const updateData = {
            niv_val: target,
            ...fields
        }

        const { error } = await supabase
            .from('ses_items_ndf')
            .update(updateData)
            .eq('id', item.id)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: item.id,
            action: `Retour de l'article ${item.num} de la NDF n°${route.params.id}${config.labelLevel ? ' au niveau ' + config.labelLevel : ''}${motif ? ' - Motif: ' + motif : ''}`,
            niv_val: target,
            cat_proc: 'ndf',
            motif_ret: motif || null,
            type: 'retour'
        })

        await getDemandeDetails()
        showAlert('Article renvoyé au niveau précédent', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du retour', 'Oops', 'danger')
    } finally {
        loadingAction.value = false
    }
}
// ====================== MODAL EDITION ======================
const btnOpenEditModal = ref(null)

const openEditModal = (item, config) => {
    editItem.value = item
    editConfig.value = config
    editFields.value = config.fields || []
    editModalTitle.value = config.modalTitle || `Modifier la ligne N° ${item.num}`

    // Préremplir avec les valeurs actuelles
    const form = {}
    editFields.value.forEach(f => {
        form[f.key] = item[f.key] ?? ''
    })
    editForm.value = form

    // Ouverture par clic (Bootstrap data-bs)
    nextTick(() => {
        btnOpenEditModal.value?.click()
    })
}

const saveEditLine = async () => {
    if (!editItem.value || !editConfig.value) return

    // Required
    for (const field of editFields.value) {
        if (field.required) {
            const val = editForm.value[field.key]
            if (val === undefined || val === null || String(val).trim() === '') {
                showAlert(`Le champ « ${field.label} » est obligatoire.`, 'Oops', 'danger')
                return
            }
        }
    }

    loadingAction.value = true
    try {
        const fieldsClean = {}
        for (const key in editForm.value) {
            const val = editForm.value[key]
            const def = editFields.value.find(f => f.key === key)
            if (def?.type === 'select' && val === '') continue
            fieldsClean[key] = val
        }

        const updateData = { ...fieldsClean }

        // Si le parent demande de renvoyer au niveau erg (ou autre)
        if (editConfig.value.setNivVal !== undefined && editConfig.value.setNivVal !== null) {
            updateData.niv_val = editConfig.value.setNivVal
        }

        const { error } = await supabase
            .from('ses_items_ndf')
            .update(updateData)
            .eq('id', editItem.value.id)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: editItem.value.id,
            action: `Modification de l'article ${editItem.value.num} de la NDF n°${route.params.id}`,
            niv_val: niveauNDF.erg,
            cat_proc: 'ndf',
            type: 'edit'
        })

        closeModal('modalEditNdfLigne')
        await getDemandeDetails()
        showAlert('Ligne modifiée avec succès', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de la modification', 'Oops', 'danger')
    } finally {
        loadingAction.value = false
    }
}
const handleEditableFieldChange = () => {
    // Hook libre si besoin (auto-save, etc.)
}

// ====================== VALIDATION EN MASSE ======================
const initMassData = () => {
    massForm.value = {}
    ;(props.massValidation?.fields || []).forEach(f => {
        massForm.value[f.key] = ''
    })
}

const validerEnMasse = async () => {
    const fields = props.massValidation?.fields || []

    // Vérifier required du modal
    for (const field of fields) {
        if (field.required && !massForm.value[field.key]) {
            showAlert(`Le champ « ${field.label} » est obligatoire.`, 'Oops', 'danger')
            return
        }
        if (field.key === 'imputation') {
            KeySaveOldValue.value = field.key
        }
    }

    const itemsToValidate = demande_details.value.filter(item => item.etat === 0)

    if (itemsToValidate.length === 0) {
        showAlert('Aucun article en attente de validation.', 'Info', 'warning')
        return
    }

    // Nettoyage : retire les champs type select qui sont vide pour ne pas envoyer '' en BDD ou le champs attend une valeur non ''
    const massFormClean = {}
    const fieldsConfig = props.massValidation?.fields || []

    for (const key in massForm.value) {
        const val = massForm.value[key]
        const fieldDef = fieldsConfig.find(f => f.key === key)

        // Si c'est un select (généralement une FK numérique type bigint) et que la valeur est vide,
        // on ne l'envoie pas du tout (pour ne pas écraser l'existant avec une valeur invalide)
        if (fieldDef?.type === 'select' && val === '') {
            continue // on saute ce champ, il ne sera pas dans massFormClean
        }

        // Pour tous les autres champs (texte, textarea...), on garde la valeur telle quelle,
        // même si elle est vide — un commentaire vide est une valeur légitime
        massFormClean[key] = val
    }

    loadingAction.value = true
    try {
        for (const item of itemsToValidate) {

            if (props.niveau === niveauNDF.cg && KeySaveOldValue.value) {
                ancienImputation.value = item.imputation
            } else {
                ancienImputation.value = null
            }

            const updateData = {
                niv_val: resolvedNextLevel.value,
                imputationOld: ancienImputation.value ? ancienImputation.value : null,
                ...massFormClean   // ← version nettoyée, sans les '' pour les champs non touchés
            }

            const { error } = await supabase
                .from('ses_items_ndf')
                .update(updateData)
                .eq('id', item.id)

            if (error) throw error

            await supabase.from('ses_histo2').insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                id_item: item.id,
                action: `Validation de l'article ${item.num} de la NDF n°${route.params.id}`,
                niv_val: resolvedNextLevel.value,
                cat_proc: 'ndf',
                type: 'valider'
            })
        }

        closeModal('valMasse')
        await getDemandeDetails()
        showAlert(
            `${itemsToValidate.length} article(s) validé(s) avec succès`,
            'Succès',
            'success'
        )
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de la validation en masse', 'Oops', 'danger')
    } finally {
        loadingAction.value = false
    }
}

// ====================== EXPORT EXCEL ======================
const exportToExcel = async () => {
    try {
        const cols = props.exportColumns.length
            ? props.exportColumns
            : props.columns.map(c => ({ key: c.key, label: c.label }))

        const exportData = demande_details.value.map(item => {
            const row = {}
            cols.forEach(col => {
                let val = item[col.key]
                if (col.key === 'niv_val' || col.key === 'statut') {
                    val =
                        Number(item.niv_val) === Number(props.niveau)
                            ? 'En attente de votre validation'
                            : Number(item.niv_val) === Number(niveauNDF.refuse)
                                ? 'Rejeté'
                                : Number(item.niv_val) < Number(props.niveau)
                                    ? 'Pas encore à votre niveau'
                                    : 'Validé'
                }
                if (col.key === 'imputation') {
                    const imputationTrouvee = imputationOptions.value.find(
                        imp => imp.value === item.imputation
                    )
                    val = imputationTrouvee ? imputationTrouvee.label : ''
                }

                row[col.label] = val ?? ''
            })
            // Infos en-tête utiles
            row['N° NDF'] = route.params.id
            row['Demandeur'] = dataObj.value.demandeur || ''
            row['Date NDF'] = dataObj.value.date || ''
            return row
        })

        const nameExcel = `Details_NDF_Num_${route.params.id}`
        await exportExcel(exportData, nameExcel)
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de l\'export Excel', 'Oops', 'danger')
    }
}
// ====================== DOCUMENTS ======================
const doc_recovery = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_doc')
            .select('*')
            .eq('id_obj', route.params.id)
            .eq('cat_proc', 'ndf')

        if (error) throw error
        doc_ndf.value = data || []
    } catch (error) {
        console.error('Erreur récupération documents NDF:', error)
        showAlert('Erreur lors du chargement des documents', 'Oops', 'danger')
    }
}

const downloadFile = async (name_doc, nameStorage) => {
    const path = `ndf/${nameStorage}`
    try {
        const encoding = encodeURI(path)
        const { data, error } = await supabase
            .storage
            .from('sesame_doc')
            .createSignedUrl(encoding, 60)

        if (error) throw error

        const a = document.createElement('a')
        a.href = data.signedUrl
        a.download = name_doc
        document.body.appendChild(a)
        a.click()
        a.remove()

        showAlert('Fichier téléchargé avec succès', 'Succès', 'success')
    } catch (error) {
        console.error('Erreur téléchargement:', error.message)
        showAlert('Erreur lors du téléchargement du fichier', 'Oups!', 'danger')
    }
}
const pdfButtonLoading = ref(false)
const pdfAfeReady = ref(true) // toujours monté si enableAfe (pour html2canvas)

const afeDate = computed(() => {
    const d = new Date()
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
})

/** Lignes non refusées pour l'AFE */
const afeLines = computed(() =>
    demande_details.value.filter(
        item => Number(item.niv_val) !== Number(niveauNDF.refuse)
    )
)

const afeTotal = computed(() =>
    afeLines.value.reduce((s, i) => s + (Number(i.montant) || 0), 0)
)

const afeTotalFormatted = computed(() =>
    new Intl.NumberFormat('fr-FR').format(afeTotal.value)
)

/** Imputations uniques (noms si déjà résolus, sinon id) */
const afeImputations = computed(() => {
    const set = new Set()
    afeLines.value.forEach(item => {
        const imputationFindLab = imputationOptions.value.find(imp => imp.value === item.imputation)
        const label =
            imputationFindLab?.label ||
            item.imputation
        if (label) set.add(String(label))
    })
    return [...set]
})

const formatMontantAfe = (val) => {
    const n = Number(val) || 0
    return new Intl.NumberFormat('fr-FR').format(n)
}

const generateAfeNdf = async () => {
    if (!afeLines.value.length) {
        showAlert('Aucune ligne à inclure dans l\'AFE.', 'Oups', 'danger')
        return
    }

    pdfButtonLoading.value = true
    try {
        await nextTick()
        const html2canvas = (await import('html2canvas')).default
        const { jsPDF } = await import('jspdf')

        const element = document.getElementById('pdfafeNdf')
        if (!element) {
            showAlert('Contenu AFE introuvable', 'Oups', 'danger')
            return
        }

        const canvas = await html2canvas(element, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            windowWidth: 794,
            letterRendering: true
        })

        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgData = canvas.toDataURL('image/png')
        const imgProps = pdf.getImageProperties(imgData)

        let imgWidth = pdfWidth
        let imgHeight = (imgProps.height * pdfWidth) / imgProps.width

        if (imgHeight > pdfHeight) {
            // plusieurs pages si besoin
            let heightLeft = imgHeight
            let position = 0
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pdfHeight
            while (heightLeft > 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                heightLeft -= pdfHeight
            }
        } else {
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
        }

        pdf.save(`AFE_NDF_${route.params.id}.pdf`)
        showAlert('AFE généré avec succès !', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de la génération de l\'AFE', 'Oups', 'danger')
    } finally {
        pdfButtonLoading.value = false
    }
}
// ====================== LIFECYCLE ======================
onMounted(async () => {
    await listImputation()
    // Injecter les options d'imputation dans massValidation si besoin
    if (props.massValidation?.fields) {
        props.massValidation.fields.forEach(f => {
            if (f.key === 'imputation' && f.type === 'select' && !f.options) {
                f.options = imputationOptions.value
            }
        })
    }
    await getDemandeDetails()
    console.log(afeLines.value);
    
})
</script>