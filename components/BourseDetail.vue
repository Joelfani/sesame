<!-- components/ValidationBourseDetail.vue -->
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
                    data-bs-target="#valMasseBourse"
                    @click="initMassData"
                >
                    Validation en masse
                </button>

                <client-only>
                    <button
                        class="btn btn-outline-dark"
                        data-bs-toggle="modal"
                        data-bs-target="#modDocBourse"
                        @click="doc_recovery"
                    >
                        Liste des documents
                    </button>
                </client-only>

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
                <h6>Objet : <span>{{ dataObj.obj_bourse }}</span></h6>
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

        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />

        <!-- Modal validation en masse -->
        <Modal
            v-if="massValidation?.enabled"
            id="valMasseBourse"
            :title="massValidation.title || 'Validation en masse'"
        >
            <div class="mb-3">
                <!-- Toggle imputation (si un champ optionalToggle / isImputation est prévu) -->
                <div v-if="hasOptionalImputationField" class="form-check mb-3">
                    <input
                        id="chkModifImputation"
                        v-model="massModifyImputation"
                        class="form-check-input"
                        type="checkbox"
                    >
                    <label class="form-check-label fw-bold" for="chkModifImputation">
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
                        :disabled="loadingAction"
                        @click="validerEnMasse"
                    >
                        Valider
                    </button>
                </div>
            </div>
        </Modal>

        <!-- Modal documents (lecture seule) -->
        <Modal id="modDocBourse" title="Documents associés">
            <div class="text-center">
                <div v-if="doc_bourse.length === 0" class="text-muted py-3">
                    Aucun document associé.
                </div>
                <p
                    v-for="doc in doc_bourse"
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
    </div>
</template>

<script setup>
import { niveauBourse } from '~/assets/js/CommonVariable.js'
import { exportExcel } from '~/assets/js/export.js'

const props = defineProps({
    titre: { type: String, default: 'VALIDATION DEMANDE DE BOURSE' },
    niveau: { type: [Number, String], required: true },
    nextLevel: { type: [Number, String], default: null },
    retourPath: { type: String, default: '' },
    columns: { type: Array, required: true },
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
    imputationOldKey: { type: String, default: 'imputation_old' }
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
const doc_bourse = ref([])
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

const computedColumns = computed(() => {
    return props.columns.map(col => {
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
        .reduce((sum, item) => sum + (Number(item.montant) || 0), 0)
    return new Intl.NumberFormat('fr-FR').format(total)
})

/** Champ imputation marqué optionalToggle / isImputation dans massValidation */
const optionalImputationField = computed(() => {
    return (props.massValidation?.fields || []).find(
        f =>
            f.optionalToggle === true ||
            ((f.isImputation || f.key === props.imputationKey) && f.optionalToggle !== false && f.type === 'select')
    )
})

/** Afficher le checkbox seulement si un tel champ existe et optionalToggle n'est pas explicitement false */
const hasOptionalImputationField = computed(() => {
    const f = (props.massValidation?.fields || []).find(
        f => f.key === props.imputationKey || f.isImputation
    )
    if (!f) return false
    // Si optionalToggle === false → toujours affiché/requis comme les autres
    // Si optionalToggle === true ou absent sur un champ isImputation → checkbox
    return f.optionalToggle === true || (f.isImputation && f.optionalToggle !== false)
})

/** Champs visibles dans le modal (imputation masquée si toggle off) */
const visibleMassFields = computed(() => {
    return (props.massValidation?.fields || []).filter(field => {
        const isImp = field.key === props.imputationKey || field.isImputation
        if (!isImp) return true
        // imputation sans toggle optionnel → toujours visible
        if (field.optionalToggle === false) return true
        // avec toggle → visible seulement si coché
        if (hasOptionalImputationField.value) return massModifyImputation.value
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
    props.columns.filter(c => c.required && c.editable).map(c => c.key)

const getMassOptions = (field) => {
    if (field.key === props.imputationKey || field.isImputation) {
        return imputationOptions.value
    }
    return field.options || []
}

const isMassFieldRequired = (field) => {
    if (!field.required) return false
    const isImp = field.key === props.imputationKey || field.isImputation
    if (isImp && hasOptionalImputationField.value) {
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
            .eq('cat_proc', 'bourse')
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
            .from('ses_items_bourse')
            .select('*')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true })

        if (error) throw error

        demande_details.value = (data || []).map(item => ({
            ...item,
            etat:
                Number(item.niv_val) === Number(props.niveau) ? 0 :
                Number(item.niv_val) === Number(niveauBourse.refuse) ? 2 :
                Number(item.niv_val) < Number(props.niveau) ? 4 : 1,
            _originalImputation: item[props.imputationKey]
        }))
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du chargement de la demande', 'Oops', 'danger')
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
            .eq('cat_proc', 'bourse')

        if (error) throw error
        doc_bourse.value = data || []
    } catch (error) {
        console.error(error)
    }
}

const downloadFile = async (name_doc, nameStorage) => {
    const path = `bourse/${nameStorage}`
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
        showAlert('Erreur lors du téléchargement', 'Oups!', 'danger')
    }
}

// ====================== VALIDATION LIGNE ======================
const handleValidationAction = async ({ action, item, editableData }) => {
    const config = getActionConfig(action)
    if (!config) return

    if (Number(item.niv_val) !== Number(props.niveau)) {
        showAlert('Cet article n\'est pas en attente à votre niveau.', 'Oops', 'danger')
        return
    }

    const fields = editableData?.fields || {}

    if (config.type === 'validate') await doValidate(item, fields)
    else if (config.type === 'reject') await doReject(item, fields, config)
    else if (config.type === 'return') await doReturn(item, fields, config)
}

const doValidate = async (item, fields) => {
    for (const key of getRequiredKeys()) {
        const val = fields[key] ?? item[key]
        if (val === undefined || val === null || val === '') {
            const col = props.columns.find(c => c.key === key)
            showAlert(`Le champ « ${col?.label || key} » est obligatoire.`, 'Oops', 'danger')
            return
        }
    }

    try {
        const updateData = {
            niv_val: resolvedNextLevel.value,
            ...fields
        }

        if (
            props.imputationOldKey &&
            fields[props.imputationKey] !== undefined &&
            item._originalImputation &&
            fields[props.imputationKey] !== item._originalImputation
        ) {
            updateData[props.imputationOldKey] = item._originalImputation
        }

        const { error } = await supabase
            .from('ses_items_bourse')
            .update(updateData)
            .eq('id', item.id)

        if (error) throw error

        const histType = Number(resolvedNextLevel.value) === Number(niveauBourse.valide) ||
            Number(props.niveau) === Number(niveauBourse.cheque)
            ? 'fin'
            : 'valider'

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: item.id,
            action: `Validation de l'article ${item.num} de la bourse n°${route.params.id}`,
            niv_val: resolvedNextLevel.value,
            cat_proc: 'bourse',
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
            .from('ses_items_bourse')
            .update({
                niv_val: niveauBourse.refuse,
                motif: motif || null,
                ...fields
            })
            .eq('id', item.id)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: item.id,
            action: `Rejet de l'article ${item.num} de la bourse n°${route.params.id} - Motif: ${motif}`,
            niv_val: niveauBourse.refuse,
            cat_proc: 'bourse',
            type: 'rejeter'
        })

        await getDemandeDetails()
        showAlert('Article rejeté', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du rejet', 'Oops', 'danger')
    }
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

    try {
        const { error } = await supabase
            .from('ses_items_bourse')
            .update({
                niv_val: target,
                motif: motif || null,
                ...fields
            })
            .eq('id', item.id)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            id_item: item.id,
            action: `Retour de l'article ${item.num} de la bourse n°${route.params.id}${config.labelLevel ? ' au niveau ' + config.labelLevel : ''}${motif ? ' - Motif: ' + motif : ''}`,
            niv_val: target,
            cat_proc: 'bourse',
            type: 'retour'
        })

        await getDemandeDetails()
        showAlert('Article renvoyé pour modification', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du retour', 'Oops', 'danger')
    }
}

const handleEditableFieldChange = () => {}

// ====================== VALIDATION EN MASSE ======================
const initMassData = () => {
    massForm.value = {}
    massModifyImputation.value = false // défaut : ne pas modifier l'imputation
    ;(props.massValidation?.fields || []).forEach(f => {
        massForm.value[f.key] = ''
    })
}

const validerEnMasse = async () => {
    const fields = props.massValidation?.fields || []

    // Validation required (imputation seulement si toggle coché)
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

    // Ne pas envoyer l'imputation si non modifiée
    const massFormClean = {}
    for (const field of fields) {
        const isImp = field.key === props.imputationKey || field.isImputation
        if (isImp && hasOptionalImputationField.value && !massModifyImputation.value) {
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
                item._originalImputation &&
                massFormClean[props.imputationKey] !== item._originalImputation
            ) {
                updateData[props.imputationOldKey] = item._originalImputation
            }

            const { error } = await supabase
                .from('ses_items_bourse')
                .update(updateData)
                .eq('id', item.id)

            if (error) throw error

            const histType = Number(resolvedNextLevel.value) === Number(niveauBourse.valide) ||
                Number(props.niveau) === Number(niveauBourse.cheque)
                ? 'fin'
                : 'valider'

            await supabase.from('ses_histo2').insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                id_item: item.id,
                action: `Validation en masse de l'article ${item.num} de la bourse n°${route.params.id}`,
                niv_val: resolvedNextLevel.value,
                cat_proc: 'bourse',
                type: histType
            })
        }

        closeModal('valMasseBourse')
        await getDemandeDetails()
        showAlert(`${itemsToValidate.length} article(s) validé(s) avec succès`, 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de la validation en masse', 'Oops', 'danger')
    } finally {
        loadingAction.value = false
    }
}

// ====================== EXPORT ======================
const exportToExcel = async () => {
    try {
        const cols = props.exportColumns.length
            ? props.exportColumns
            : props.columns.map(c => ({ key: c.key, label: c.label }))

        const impMap = Object.fromEntries(
            imputationOptions.value.map(o => [o.value, o.label])
        )

        const exportData = demande_details.value.map(item => {
            const row = {
                'N° Bourse': route.params.id,
                'Demandeur': dataObj.value.demandeur || '',
                'Objet': dataObj.value.obj_bourse || '',
                'Date demande': dataObj.value.date || ''
            }

            cols.forEach(col => {
                let val = item[col.key]
                if (col.key === props.imputationKey || col.key === props.imputationOldKey) {
                    val = impMap[val] || val || ''
                }
                if (col.key === 'niv_val' || col.key === 'statut' || col.key === 'statut_ligne') {
                    val =
                        Number(item.niv_val) === Number(props.niveau)
                            ? 'En attente de votre validation'
                            : Number(item.niv_val) === Number(niveauBourse.refuse)
                                ? 'Rejeté'
                                : Number(item.niv_val) < Number(props.niveau)
                                    ? 'Pas encore à votre niveau'
                                    : 'Validé'
                }
                row[col.label] = val ?? ''
            })
            return row
        })

        await exportExcel(exportData, `Details_Bourse_Num_${route.params.id}`)
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de l\'export Excel', 'Oops', 'danger')
    }
}

onMounted(async () => {
    await listImputation()
    await getDemandeDetails()
})
</script>