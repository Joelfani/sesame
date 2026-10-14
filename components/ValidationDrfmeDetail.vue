<!-- components/ValidationDrfmeDetail.vue -->
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
                    v-if="massValidation?.enabled"
                    class="btn btn-outline-secondary"
                    data-bs-toggle="modal"
                    data-bs-target="#valMasseDrfme"
                    @click="initMassData"
                >
                    Validation en masse
                </button>

                <button
                    class="btn btn-outline-dark"
                    data-bs-toggle="modal"
                    data-bs-target="#modDocDrfme"
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

        <!-- Infos générales -->
        <div class="row mb-3">
            <div class="col-8">
                <h6>N° d'enregistrement : <span>{{ route.params.id }}</span></h6>
                <h6>Date : <span>{{ dataObj.date }}</span></h6>
                <h6>Projet : <strong>{{ dataObj.projet || '-' }}</strong></h6>
                <h6>Demandeur : <strong>{{ dataObj.demandeur }}</strong></h6>
            </div>
            <div class="col-4 d-flex flex-column justify-content-center align-items-end">
                <h6>Total part SESAME : <strong>{{ totalAmount }} Ar</strong></h6>
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

        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />

        <!-- Modal validation en masse -->
        <Modal
            v-if="massValidation?.enabled"
            id="valMasseDrfme"
            :title="massValidation.title || 'Validation en masse'"
        >
            <div class="mb-3">
                <!-- Checkbox uniquement si optionalToggle === true -->
                <div v-if="hasOptionalImputationField" class="form-check mb-3">
                    <input
                        id="chkModifImputationDrfme"
                        v-model="massModifyImputation"
                        class="form-check-input"
                        type="checkbox"
                    >
                    <label class="form-check-label fw-bold" for="chkModifImputationDrfme">
                        Modifier l'imputation analytique
                    </label>
                    <div class="form-text">
                        Décoché par défaut : les imputations actuelles des lignes sont conservées.
                    </div>
                </div>

                <div
                    v-for="field in visibleMassFields"
                    :key="field.key"
                    class="mb-3"
                >
                    <label class="form-label fw-bold">
                        {{ field.label }}
                        <span v-if="isMassFieldRequired(field)" class="text-danger">*</span>
                    </label>

                    <select
                        v-if="field.type === 'select'"
                        v-model="massForm[field.key]"
                        class="form-select"
                    >
                        <option value="">-- Sélectionner --</option>
                        <option
                            v-for="opt in getMassOptions(field)"
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
        <Modal id="modDocDrfme" title="Documents associés à la DRFME">
            <div class="text-center">
                <div v-if="doc_drfme.length === 0" class="text-muted py-3">
                    Aucun document associé.
                </div>
                <p
                    v-for="doc in doc_drfme"
                    :key="doc.id"
                    class="d-flex justify-content-between align-items-center border-bottom py-2"
                >
                    <span style="font-weight: bold;">{{ doc.name_doc }}</span>
                    <button
                        class="btn btn-outline-secondary btn-sm"
                        @click="downloadFile(doc.name_doc, doc.nameStorage)"
                    >
                        <img src="/public/icon/download.png" style="width: 20px; height: 20px;" alt="Télécharger">
                    </button>
                </p>
            </div>
        </Modal>

        <!-- Modal édition -->
        <button
            ref="btnOpenEditModal"
            type="button"
            class="d-none"
            data-bs-toggle="modal"
            data-bs-target="#modalEditDrfmeLigne"
        ></button>

        <Modal id="modalEditDrfmeLigne" :title="editModalTitle">
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
                            v-for="opt in getMassOptions(field)"
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
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                <button class="btn btn-primary" :disabled="loadingAction" @click="saveEditLine">
                    Enregistrer
                </button>
            </div>
        </Modal>

        <!-- Modal motif retour -->
        <button
            ref="btnOpenReturnModal"
            type="button"
            class="d-none"
            data-bs-toggle="modal"
            data-bs-target="#modalRetourDrfme"
        ></button>

        <Modal id="modalRetourDrfme" title="Motif de retour">
            <div class="mb-3">
                <label class="form-label fw-bold">
                    Motif du retour <span class="text-danger">*</span>
                </label>
                <textarea
                    v-model="returnMotif"
                    class="form-control"
                    rows="4"
                    placeholder="Indiquez le motif du retour..."
                ></textarea>
            </div>
            <div class="d-flex gap-2 justify-content-end mb-2">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                <button
                    class="btn btn-outline-primary"
                    :disabled="loadingAction"
                    @click="confirmReturn"
                >
                    Confirmer le retour
                </button>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { niveauDRFME } from '~/assets/js/CommonVariable.js'
import { exportExcel } from '~/assets/js/export.js'

/** Colonnes de base = saisie collaborateur */
const BASE_COLUMNS = [
    { key: 'num', label: 'N°' },
    { key: 'designation', label: 'Désignation', style: { minWidth: '200px' } },
    { key: 'montant_total', label: 'Montant total (Ar)' },
    { key: 'montant_etudiant', label: 'Part étudiant (Ar)' },
    { key: 'montant_sesame', label: 'Part SESAME (Ar)' },
    { key: 'detail', label: 'Motif ou destination', style: { minWidth: '200px' } },
    { key: 'observation', label: 'Observation', style: { minWidth: '180px' } },
]

const props = defineProps({
    titre: { type: String, default: 'VALIDATION DE LA DRFME' },
    niveau: { type: [Number, String], required: true },
    nextLevel: { type: [Number, String], default: null },
    retourPath: { type: String, default: '' },
    columns: { type: Array, default: () => [] },
    actions: {
        type: Array,
        default: () => [
            { label: 'Valider', color: 'success', type: 'validate' },
            { label: 'Rejeter', color: 'secondary', type: 'reject', requireMotif: true }
        ]
    },
    massValidation: {
        type: Object,
        default: () => ({ enabled: false, fields: [] })
    },
    exportColumns: { type: Array, default: () => [] },
    checkSup: { type: Boolean, default: false },
    imputationKey: { type: String, default: 'imputation' },
    imputationOldKey: { type: String, default: 'imputationOld' },
    totalKey: { type: String, default: 'montant_sesame' }
})

const supabase = useSupabaseClient()
const userStore = useUserStore()
const route = useRoute()

const loading = ref(true)
const loadingAction = ref(false)
const tableRef = ref(null)
const dataObj = ref({})
const demande_details = ref([])
const massForm = ref({})
const imputationOptions = ref([])
const doc_drfme = ref([])

const editForm = ref({})
const editFields = ref([])
const editItem = ref(null)
const editConfig = ref(null)
const editModalTitle = ref('Modifier la ligne')
const btnOpenEditModal = ref(null)

const btnOpenReturnModal = ref(null)
const returnMotif = ref('')
const pendingReturn = ref(null)

/** Case à cocher : modifier l'imputation en masse (défaut non) */
const massModifyImputation = ref(false)

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

const tableActions = computed(() =>
    props.actions.map(a => ({ label: a.label, color: a.color }))
)

const mergedColumns = computed(() => {
    const extra = props.columns || []
    const baseKeys = new Set(BASE_COLUMNS.map(c => c.key))
    const onlyExtra = extra.filter(c => !baseKeys.has(c.key))
    return [...BASE_COLUMNS, ...onlyExtra]
})

const computedColumns = computed(() => {
    return mergedColumns.value.map(col => {
        if (
            (col.key === props.imputationKey || col.isImputation) &&
            col.type === 'select' &&
            !col.options
        ) {
            return { ...col, options: imputationOptions.value }
        }
        return col
    })
})

const totalAmount = computed(() => {
    const total = demande_details.value
        .filter(item => item.etat !== 2)
        .reduce((sum, item) => sum + (Number(item[props.totalKey]) || 0), 0)
    return new Intl.NumberFormat('fr-FR').format(total)
})

/**
 * Checkbox visible UNIQUEMENT si optionalToggle === true explicitement.
 * - Supérieur (pas de optionalToggle ou false) → pas de checkbox, select normal
 * - CG (optionalToggle: true) → checkbox + select conditionnel
 */
const hasOptionalImputationField = computed(() => {
    const f = (props.massValidation?.fields || []).find(
        f => f.key === props.imputationKey || f.isImputation
    )
    if (!f) return false
    return f.optionalToggle === true
})

/** Champs visibles : imputation masquée seulement si optionalToggle true ET checkbox off */
const visibleMassFields = computed(() => {
    return (props.massValidation?.fields || []).filter(field => {
        const isImp = field.key === props.imputationKey || field.isImputation
        if (!isImp) return true
        if (field.optionalToggle === true) {
            return massModifyImputation.value
        }
        // optionalToggle false / absent → toujours visible
        return true
    })
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

const getActionConfig = (label) => props.actions.find(a => a.label === label) || null

const getRequiredKeys = () =>
    mergedColumns.value.filter(c => c.required && c.editable).map(c => c.key)

const getMassOptions = (field) => {
    if (field.key === props.imputationKey || field.isImputation) {
        return imputationOptions.value
    }
    return field.options || []
}

const isMassFieldRequired = (field) => {
    if (!field.required) return false
    const isImp = field.key === props.imputationKey || field.isImputation
    // Si optionalToggle true : required seulement quand checkbox cochée
    if (isImp && field.optionalToggle === true) {
        return massModifyImputation.value
    }
    return true
}

// ====================== DATA ======================
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
            value: imp.id
        }))
    } catch (error) {
        console.error('Erreur imputations:', error)
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
            .eq('cat_proc', 'drfme')
            .single()

        if (demandeObjError) throw demandeObjError

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
            .from('ses_items_drfme')
            .select('*')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true })

        if (error) throw error

        demande_details.value = (data || []).map(item => ({
            ...item,
            etat:
                Number(item.niv_val) === Number(props.niveau) ? 0 :
                Number(item.niv_val) === Number(niveauDRFME.refuse) ? 2 :
                Number(item.niv_val) < Number(props.niveau) ? 4 : 1,
            _originalImputation: item[props.imputationKey]
        }))
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du chargement de la DRFME', 'Oops', 'danger')
    } finally {
        loading.value = false
    }
}

// ====================== DOCUMENTS ======================
const doc_recovery = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_doc')
            .select('*')
            .eq('id_obj', route.params.id)
            .eq('cat_proc', 'drfme')

        if (error) throw error
        doc_drfme.value = data || []
    } catch (error) {
        console.error(error)
        showAlert('Erreur chargement documents', 'Oops', 'danger')
    }
}

const downloadFile = async (name_doc, nameStorage) => {
    const path = `drfme/${nameStorage}`
    try {
        const encoding = encodeURI(path)
        const { data, error } = await supabase.storage
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
        console.error(error)
        showAlert('Erreur téléchargement', 'Oups!', 'danger')
    }
}

// ====================== ACTIONS LIGNE ======================
const handleValidationAction = async ({ action, item, editableData }) => {
    const config = getActionConfig(action)
    if (!config) return

    if (Number(item.niv_val) !== Number(props.niveau)) {
        showAlert("Cet article n'est pas en attente à votre niveau.", 'Oops', 'danger')
        return
    }

    const fields = editableData?.fields || {}

    if (config.type === 'validate') await doValidate(item, fields)
    else if (config.type === 'reject') await doReject(item, fields, config)
    else if (config.type === 'return') {
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
    for (const key of getRequiredKeys()) {
        const val = fields[key] ?? item[key]
        if (val === undefined || val === null || val === '') {
            const col = mergedColumns.value.find(c => c.key === key)
            showAlert(`Le champ « ${col?.label || key} » est obligatoire.`, 'Oops', 'danger')
            return
        }
    }

    const fieldsClean = {}
    for (const key in fields) {
        const val = fields[key]
        const colDef = mergedColumns.value.find(c => c.key === key)
        if (colDef?.type === 'select' && val === '') continue
        fieldsClean[key] = val
    }

    try {
        const updateData = {
            niv_val: resolvedNextLevel.value,
            ...fieldsClean
        }

        if (
            props.imputationOldKey &&
            fieldsClean[props.imputationKey] !== undefined &&
            item._originalImputation != null &&
            fieldsClean[props.imputationKey] !== item._originalImputation
        ) {
            updateData[props.imputationOldKey] = item._originalImputation
        }

        const { error } = await supabase
            .from('ses_items_drfme')
            .update(updateData)
            .eq('id', item.id)

        if (error) throw error

        const histType =
            Number(resolvedNextLevel.value) === Number(niveauDRFME.valide) ||
            Number(props.niveau) === Number(niveauDRFME.cheque)
                ? 'fin'
                : 'valider'

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: item.id,
            action: `Validation de l'article ${item.num} de la DRFME n°${route.params.id}`,
            niv_val: resolvedNextLevel.value,
            cat_proc: 'drfme',
            type: histType
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
        const { error } = await supabase
            .from('ses_items_drfme')
            .update({
                niv_val: niveauDRFME.refuse,
                motif: motif || null,
                ...fields
            })
            .eq('id', item.id)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: item.id,
            action: `Rejet de l'article ${item.num} de la DRFME n°${route.params.id} - Motif: ${motif}`,
            niv_val: niveauDRFME.refuse,
            cat_proc: 'drfme',
            type: 'rejeter'
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
    await doReturn(item, fields, config, motif)
    closeModal('modalRetourDrfme')
    pendingReturn.value = null
    returnMotif.value = ''
}

const doReturn = async (item, fields, config, motifFromModal = null) => {
    const target = config.targetLevel
    if (target === undefined || target === null) {
        showAlert('Niveau de retour non configuré.', 'Oops', 'danger')
        return
    }

    const motif = (motifFromModal ?? '').trim()
    if (config.requireMotif && !motif) {
        showAlert('Veuillez indiquer un motif de retour.', 'Oops', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const fieldsClean = { ...fields }
        delete fieldsClean.motif

        const { error } = await supabase
            .from('ses_items_drfme')
            .update({
                niv_val: target,
                ...fieldsClean
            })
            .eq('id', item.id)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: item.id,
            action: `Retour de l'article ${item.num} de la DRFME n°${route.params.id}${config.labelLevel ? ' au niveau ' + config.labelLevel : ''}${motif ? ' - Motif: ' + motif : ''}`,
            niv_val: target,
            cat_proc: 'drfme',
            type: 'retour',
            motif_ret: motif || null
        })

        await getDemandeDetails()
        showAlert('Article renvoyé', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du retour', 'Oops', 'danger')
    } finally {
        loadingAction.value = false
    }
}

// ====================== EDIT ======================
const openEditModal = (item, config) => {
    editItem.value = item
    editConfig.value = config
    editFields.value = config.fields || []
    editModalTitle.value = config.modalTitle || `Modifier la ligne N° ${item.num}`
    const form = {}
    editFields.value.forEach(f => {
        form[f.key] = item[f.key] ?? ''
    })
    editForm.value = form
    nextTick(() => btnOpenEditModal.value?.click())
}

const saveEditLine = async () => {
    if (!editItem.value || !editConfig.value) return

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
        if (editConfig.value.setNivVal !== undefined && editConfig.value.setNivVal !== null) {
            updateData.niv_val = editConfig.value.setNivVal
        }

        const { error } = await supabase
            .from('ses_items_drfme')
            .update(updateData)
            .eq('id', editItem.value.id)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: editItem.value.id,
            action: `Modification de l'article ${editItem.value.num} de la DRFME n°${route.params.id}`,
            niv_val: props.niveau,
            cat_proc: 'drfme',
            type: 'edit'
        })

        closeModal('modalEditDrfmeLigne')
        await getDemandeDetails()
        showAlert('Ligne modifiée avec succès', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de la modification', 'Oops', 'danger')
    } finally {
        loadingAction.value = false
    }
}

const handleEditableFieldChange = () => {}

// ====================== MASSE ======================
const initMassData = () => {
    massForm.value = {}
    massModifyImputation.value = false
    ;(props.massValidation?.fields || []).forEach(f => {
        massForm.value[f.key] = ''
    })
}

const validerEnMasse = async () => {
    const fields = props.massValidation?.fields || []

    for (const field of fields) {
        if (!isMassFieldRequired(field)) continue
        const val = massForm.value[field.key]
        if (val === undefined || val === null || val === '') {
            showAlert(`Le champ « ${field.label} » est obligatoire.`, 'Oops', 'danger')
            return
        }
    }

    const itemsToValidate = demande_details.value.filter(item => item.etat === 0)
    if (itemsToValidate.length === 0) {
        showAlert('Aucun article en attente de validation.', 'Info', 'warning')
        return
    }

    const massFormClean = {}
    for (const field of fields) {
        const isImp = field.key === props.imputationKey || field.isImputation
        // Ne pas envoyer l'imputation si optionalToggle true et checkbox off
        if (isImp && field.optionalToggle === true && !massModifyImputation.value) {
            continue
        }
        const val = massForm.value[field.key]
        if (field.type === 'select' && val === '') continue
        massFormClean[field.key] = val
    }

    loadingAction.value = true
    try {
        for (const item of itemsToValidate) {
            const updateData = {
                niv_val: resolvedNextLevel.value,
                ...massFormClean
            }

            if (
                props.imputationOldKey &&
                massFormClean[props.imputationKey] &&
                item._originalImputation != null &&
                massFormClean[props.imputationKey] !== item._originalImputation &&
                fields.optionalToggle
            ) {
                updateData[props.imputationOldKey] = item._originalImputation
            }

            const { error } = await supabase
                .from('ses_items_drfme')
                .update(updateData)
                .eq('id', item.id)

            if (error) throw error

            const histType =
                Number(resolvedNextLevel.value) === Number(niveauDRFME.valide) ||
                Number(props.niveau) === Number(niveauDRFME.cheque)
                    ? 'fin'
                    : 'valider'

            await supabase.from('ses_histo2').insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                id_item: item.id,
                action: `Validation en masse de l'article ${item.num} de la DRFME n°${route.params.id}`,
                niv_val: resolvedNextLevel.value,
                cat_proc: 'drfme',
                type: histType
            })
        }

        closeModal('valMasseDrfme')
        await getDemandeDetails()
        showAlert(`${itemsToValidate.length} article(s) validé(s)`, 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur validation en masse', 'Oops', 'danger')
    } finally {
        loadingAction.value = false
    }
}

// ====================== EXPORT ======================
const exportToExcel = async () => {
    try {
        const cols = props.exportColumns.length
            ? props.exportColumns
            : mergedColumns.value.map(c => ({ key: c.key, label: c.label }))

        const impMap = Object.fromEntries(
            imputationOptions.value.map(o => [o.value, o.label])
        )

        const exportData = demande_details.value.map(item => {
            const row = {
                'N° DRFME': route.params.id,
                Demandeur: dataObj.value.demandeur || '',
                Projet: dataObj.value.projet || '',
                'Date demande': dataObj.value.date || ''
            }

            cols.forEach(col => {
                let val = item[col.key]
                if (col.key === props.imputationKey || col.key === props.imputationOldKey) {
                    val = impMap[val] || val || ''
                }
                if (col.key === 'niv_val' || col.key === 'statut') {
                    val =
                        Number(item.niv_val) === Number(props.niveau)
                            ? 'En attente de votre validation'
                            : Number(item.niv_val) === Number(niveauDRFME.refuse)
                                ? 'Rejeté'
                                : Number(item.niv_val) < Number(props.niveau)
                                    ? 'Pas encore à votre niveau'
                                    : 'Validé'
                }
                row[col.label] = val ?? ''
            })
            return row
        })

        await exportExcel(exportData, `Details_DRFME_Num_${route.params.id}`)
    } catch (error) {
        console.error(error)
        showAlert("Erreur lors de l'export Excel", 'Oops', 'danger')
    }
}

onMounted(async () => {
    await listImputation()
    if (props.massValidation?.fields) {
        props.massValidation.fields.forEach(f => {
            if ((f.key === props.imputationKey || f.isImputation) && f.type === 'select' && !f.options) {
                f.options = imputationOptions.value
            }
        })
    }
    await getDemandeDetails()
})
</script>