<!-- components/OdmForm.vue -->
<template>
    <div class="purchase_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>{{ titre }}</h1>
            <div class="d-flex gap-2">
                <NuxtLink
                    v-if="retourPath"
                    :to="retourPath"
                    class="btn btn-outline-secondary"
                >
                    Retour à la liste
                </NuxtLink>
            </div>
        </div>

        <!-- Infos générales (hors création) -->
        <div v-if="!isCreate && dataObj.id" class="mb-4">
            <h6>N° d'enregistrement : <strong>{{ dataObj.id }}</strong></h6>
            <h6>Date de la demande : <strong>{{ dataObj.date_formatted }}</strong></h6>
            <h6 v-if="showDemandeur">Demandeur : <strong>{{ dataObj.demandeur }}</strong></h6>
            <h6 v-if="showSuperieur">Supérieur : <strong>{{ dataObj.superieur }}</strong></h6>
            <h6>Statut : <strong>{{ statutLabel }}</strong></h6>
        </div>

        <h5 v-if="sousTitre" class="mb-3">{{ sousTitre }}</h5>

        <!-- Formulaire -->
        <div class="row g-3 mb-4">
            <div
                v-for="field in visibleFields"
                :key="field.key"
                :class="field.colClass || 'col-md-6'"
            >
                <label class="form-label fw-bold">
                    {{ field.label }}
                    <span v-if="isFieldRequired(field)" class="text-danger">*</span>
                </label>

                <!-- Radios cas mission -->
                <div v-if="field.type === 'radio_cas'" class="d-flex flex-column gap-2">
                    <div class="row">
                        <div
                            v-for="opt in CAS_OPTIONS"
                            :key="opt.value"
                            class="form-check border rounded p-3 col-4"
                            :class="{ 'bg-light': form[field.key] === opt.value }"
                            
                        >
                        <input
                            :id="`cas_${opt.value}`"
                            v-model="form[field.key]"
                            class="form-check-input g-3"
                            type="radio"
                            :value="opt.value"
                            :disabled="isFieldDisabled(field)"
                            :name="field.key"
                        >
                        <label class="form-check-label" :for="`cas_${opt.value}`">
                            <strong>{{ opt.label }}</strong>
                            <div class="text-muted small mt-1" style="white-space: pre-line;">{{ opt.detail }}</div>
                            <!--<div class="small fw-semibold mt-1">Formule : {{ opt.formule }}</div>-->
                        </label>
                    </div>
                    </div>
                    
                    <div v-if="nbJours !== null" class="form-text">
                        Nombre de jours calculé : <strong>{{ nbJours }}</strong>
                        <span v-if="nbJours >= 1"> — nuitées : <strong>{{ Math.max(0, nbJours - 1) }}</strong></span>
                    </div>
                </div>

                <!-- Montant calculé (disabled) -->
                <div v-else-if="field.type === 'montant'">
                    <input
                        type="text"
                        class="form-control"
                        :value="montantFormatted"
                        disabled
                    >
                    <div class="form-text">Calculé automatiquement selon les dates et le type de mission.</div>
                </div>

                <input
                    v-else-if="field.type === 'text' || !field.type"
                    v-model="form[field.key]"
                    type="text"
                    class="form-control"
                    :disabled="isFieldDisabled(field)"
                    :placeholder="field.placeholder || ''"
                >

                <input
                    v-else-if="field.type === 'date'"
                    v-model="form[field.key]"
                    type="date"
                    class="form-control"
                    :disabled="isFieldDisabled(field)"
                >

                <textarea
                    v-else-if="field.type === 'textarea'"
                    v-model="form[field.key]"
                    class="form-control"
                    rows="3"
                    :disabled="isFieldDisabled(field)"
                    :placeholder="field.placeholder || ''"
                ></textarea>

                <select
                    v-else-if="field.type === 'select'"
                    v-model="form[field.key]"
                    class="form-select"
                    :disabled="isFieldDisabled(field)"
                >
                    <option value="">-- Sélectionner --</option>
                    <option
                        v-for="opt in getSelectOptions(field)"
                        :key="opt.value"
                        :value="opt.value"
                    >
                        {{ opt.label }}
                    </option>
                </select>

                <input
                    v-else-if="field.type === 'number'"
                    v-model.number="form[field.key]"
                    type="number"
                    class="form-control"
                    :disabled="isFieldDisabled(field)"
                    :min="field.min"
                >
            </div>
        </div>

        <!-- Actions -->
        <div class="d-flex gap-2 flex-wrap">
            <button
                v-if="isCreate"
                class="btn btn-success"
                :disabled="loadingAction"
                @click="creerODM"
            >
                Envoyer l'ordre de mission
            </button>

            <template v-else>
                <button
                    v-if="allowEditMode && !modeEdition"
                    class="btn btn-outline-primary"
                    :disabled="loadingAction || !isAtCurrentLevel"
                    @click="startEdition"
                >
                    Modifier
                </button>
                <button
                    v-if="allowEditMode && modeEdition"
                    class="btn btn-primary"
                    :disabled="loadingAction"
                    @click="doSave"
                >
                    Enregistrer
                </button>
                <button
                    v-if="allowEditMode && modeEdition"
                    class="btn btn-outline-secondary"
                    :disabled="loadingAction"
                    @click="cancelEdition"
                >
                    Annuler
                </button>

                <button
                    v-for="action in actions"
                    :key="action.label"
                    class="btn"
                    :class="`btn-outline-${action.color || 'primary'}`"
                    :disabled="loadingAction || isActionDisabled(action)"
                    @click="handleAction(action)"
                >
                    {{ action.label }}
                </button>
            </template>
        </div>

        <button
            ref="btnOpenMotif"
            type="button"
            class="d-none"
            data-bs-toggle="modal"
            data-bs-target="#modalMotifOdm"
        ></button>

        <Modal id="modalMotifOdm" :title="motifModalTitle">
            <div class="mb-3">
                <label class="form-label fw-bold">
                    {{ motifModalLabel }}
                    <span class="text-danger">*</span>
                </label>
                <textarea
                    v-model="motifTexte"
                    class="form-control"
                    rows="4"
                    placeholder="Saisir le motif..."
                ></textarea>
            </div>
            <div class="d-flex gap-2 justify-content-end">
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Annuler
                </button>
                <button
                    class="btn btn-outline-danger"
                    :disabled="loadingAction"
                    @click="confirmMotifAction"
                >
                    Confirmer
                </button>
            </div>
        </Modal>

        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />
    </div>
</template>

<script setup>
import { niveauODM } from '~/assets/js/CommonVariable.js'

const CAS_OPTIONS = [
    {
        value: 'tana',
        label: 'Cas 1 : Mission Tanà (VAD, Salon, …)',
        detail: 'Déjeuner (15 000 Ar)',
        formule: '15 000 Ar × nombre de jours'
    },
    {
        value: 'ceres',
        label: 'Cas 2 : Mission avec hébergement sur Campus CERES',
        detail: 'Petit-déjeuner (10 000) - Déjeuner (15 000) - Dîner (15 000)',
        formule: '(40 000 Ar × (nombre de jours − 1)) + 25 000 Ar'
    },
    {
        value: 'hebergement',
        label: 'Cas 3 : Mission avec hébergement',
        detail: 'Petit-déjeuner (10 000) - Déjeuner (15 000) - Dîner (15 000) - Hébergement (50 000)',
        formule: '(90 000 Ar × (nombre de nuitées ou jours − 1)) + 25 000 Ar'
    }
]

const props = defineProps({
    titre: { type: String, default: 'ORDRE DE MISSION' },
    sousTitre: { type: String, default: '' },
    niveau: { type: [Number, String], default: null },
    nextLevel: { type: [Number, String], default: null },
    isCreate: { type: Boolean, default: false },
    showDemandeur: { type: Boolean, default: true },
    showSuperieur: { type: Boolean, default: false },
    retourPath: { type: String, default: '/demande/odm' },
    fields: { type: Array, required: true },
    actions: { type: Array, default: () => [] },
    checkSup: { type: Boolean, default: false },
    allowEditMode: { type: Boolean, default: false },
    imputationKey: { type: String, default: 'imputation' }
})

const supabase = useSupabaseClient()
const userStore = useUserStore()
const route = useRoute()

const loading = ref(true)
const loadingAction = ref(false)
const dataObj = ref({})
const form = ref({})
const formBackup = ref({})
const motifTexte = ref('')
const pendingAction = ref(null)
const modeEdition = ref(false)
const imputationOptions = ref([])
const btnOpenMotif = ref(null)

const alert = ref({ show: false, message: '', title: '', type: '' })
const showAlert = (message, title, type) => {
    alert.value = { show: true, message, title, type }
    setTimeout(() => { alert.value.show = false }, 5000)
}

// ====================== JOURS / MONTANT ======================
/** Nombre de jours inclus entre miss_date1 et miss_date2 */
const nbJours = computed(() => {
    const d1 = form.value.miss_date1
    const d2 = form.value.miss_date2
    if (!d1 || !d2) return null
    const a = new Date(d1)
    const b = new Date(d2)
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null
    const diff = Math.round((b - a) / (1000 * 60 * 60 * 24))
    if (diff < 0) return null
    return diff + 1
})

const montantCalcule = computed(() => {
    const jours = nbJours.value
    const cas = form.value.miss_cas
    if (!jours || !cas) return null

    const nuitees = Math.max(0, jours - 1)

    switch (cas) {
        case 'tana':
            return 15000 * jours
        case 'ceres':
            return 40000 * nuitees + 25000
        case 'hebergement':
            return 90000 * nuitees + 25000
        default:
            return null
    }
})

const montantFormatted = computed(() => {
    if (montantCalcule.value === null || montantCalcule.value === undefined) return ''
    return new Intl.NumberFormat('fr-FR').format(montantCalcule.value) + ' Ar'
})

// Synchronise form.montant dès que le calcul change
watch(
    montantCalcule,
    (val) => {
        form.value.montant = val
    },
    { immediate: true }
)

// ====================== COMPUTED UI ======================
const resolvedNextLevel = computed(() => {
    if (props.nextLevel !== null && props.nextLevel !== undefined) return props.nextLevel
    if (props.niveau === null || props.niveau === undefined) return niveauODM.superieur
    return Number(props.niveau) + 1
})

const isAtCurrentLevel = computed(() => {
    if (props.isCreate) return true
    return Number(dataObj.value.niv_val) === Number(props.niveau)
})

const visibleFields = computed(() => {
    return props.fields.filter(field => {
        if (props.isCreate) {
            return (field.createMode || 'edit') !== 'hidden'
        }
        const mode = field.levels?.[props.niveau] ?? 'readonly'
        return mode !== 'hidden'
    })
})

const statutLabel = computed(() => {
    const val = Number(dataObj.value.niv_val)
    switch (val) {
        case niveauODM.erg: return 'En attente de modification par le demandeur'
        case niveauODM.superieur: return 'En attente de validation chez le supérieur'
        case niveauODM.rh: return 'En attente de validation RH'
        case niveauODM.finance: return 'En attente de validation finance'
        case niveauODM.cg: return 'En attente de validation CG'
        case niveauODM.dpr: return 'En attente de validation chez le DPR'
        case niveauODM.cheque: return 'En attente d\'émission de chèque'
        case niveauODM.valide: return 'Validé'
        case niveauODM.refuse: return 'Refusé'
        default: return 'Statut inconnu'
    }
})

const motifModalTitle = computed(() =>
    pendingAction.value?.type === 'return' ? 'Retour au collaborateur' : 'Refus de l\'ordre de mission'
)

const motifModalLabel = computed(() =>
    pendingAction.value?.type === 'return' ? 'Motif du retour' : 'Motif de rejet'
)

// ====================== FIELD HELPERS ======================
const getSelectOptions = (field) => {
    if (field.key === props.imputationKey || field.isImputation) {
        return imputationOptions.value
    }
    return field.options || []
}

const isFieldDisabled = (field) => {
    if (field.type === 'montant') return true

    if (props.isCreate) {
        return (field.createMode || 'edit') === 'readonly'
    }

    if (!isAtCurrentLevel.value) return true

    if (props.allowEditMode && modeEdition.value) {
        return false
    }

    const mode = field.levels?.[props.niveau] ?? 'readonly'
    return mode !== 'edit'
}

const isFieldRequired = (field) => {
    if (field.type === 'montant') return false
    if (props.isCreate) return !!field.requiredOnCreate
    return Array.isArray(field.requiredAt) && field.requiredAt.includes(props.niveau)
}

const isActionDisabled = (action) => {
    if (!isAtCurrentLevel.value) return true
    if (props.allowEditMode && modeEdition.value) return true
    return false
}

const validateForm = () => {
    for (const field of visibleFields.value) {
        if (!isFieldRequired(field)) continue
        const val = form.value[field.key]
        if (val === undefined || val === null || String(val).trim() === '') {
            showAlert(`Le champ « ${field.label} » est obligatoire.`, 'Oops', 'danger')
            return false
        }
    }

    if (form.value.miss_date1 && form.value.miss_date2) {
        if (nbJours.value === null) {
            showAlert('La date de fin doit être postérieure ou égale à la date de début.', 'Oops', 'danger')
            return false
        }
    }

    if (form.value.miss_cas && montantCalcule.value === null) {
        showAlert('Impossible de calculer le montant : vérifiez les dates et le type de mission.', 'Oops', 'danger')
        return false
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
        console.error('Erreur chargement imputations:', error)
    }
}

const initEmptyForm = () => {
    const obj = {}
    props.fields.forEach(f => {
        if (f.type === 'number' || f.type === 'montant') obj[f.key] = null
        else obj[f.key] = ''
    })
    // défauts utiles
    if (obj.miss_cas === undefined) obj.miss_cas = ''
    if (obj.montant === undefined) obj.montant = null
    form.value = obj
}

const getDemande = async () => {
    if (props.isCreate) {
        initEmptyForm()
        loading.value = false
        return
    }

    loading.value = true
    try {
        const { data, error } = await supabase
            .from('ses_obj')
            .select(`
                *,
                users: id_user ( full_name ),
                sup: id_sup ( full_name )
            `)
            .eq('id', route.params.id)
            .eq('cat_proc', 'odm')
            .single()

        if (error) throw error

        if (props.checkSup && data.id_sup !== userStore.id) {
            loading.value = false
            setTimeout(() => navigateTo(props.retourPath), 400)
            return
        }

        if (Number(props.niveau) === Number(niveauODM.erg) && data.id_user !== userStore.id) {
            loading.value = false
            setTimeout(() => navigateTo(props.retourPath), 400)
            return
        }

        dataObj.value = {
            ...data,
            date_formatted: formatDate(data.date),
            demandeur: data.users?.full_name || 'Nom non trouvé',
            superieur: data.sup?.full_name || 'Nom non trouvé'
        }

        const obj = {}
        props.fields.forEach(f => {
            obj[f.key] = data[f.key] ?? (f.type === 'number' || f.type === 'montant' ? null : '')
        })
        form.value = obj
        modeEdition.value = false
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du chargement de l\'ordre de mission', 'Erreur', 'danger')
    } finally {
        loading.value = false
    }
}

// ====================== MODE ÉDITION ======================
const startEdition = () => {
    formBackup.value = { ...form.value }
    modeEdition.value = true
}

const cancelEdition = () => {
    form.value = { ...formBackup.value }
    modeEdition.value = false
}

const buildFormPayload = () => {
    const payload = {}
    visibleFields.value.forEach(field => {
        if (!isFieldDisabled(field) || modeEdition.value || field.type === 'montant') {
            payload[field.key] = form.value[field.key]
        }
    })
    // Toujours envoyer le montant calculé + cas
    payload.montant = montantCalcule.value ?? form.value.montant
    if (form.value.miss_cas !== undefined) payload.miss_cas = form.value.miss_cas
    if (form.value[props.imputationKey] !== undefined) {
        payload[props.imputationKey] = form.value[props.imputationKey]
    }
    return payload
}

const doSave = async () => {
    if (!validateForm()) return

    loadingAction.value = true
    try {
        const payload = {}
        visibleFields.value.forEach(field => {
            payload[field.key] = form.value[field.key]
        })
        payload.montant = montantCalcule.value ?? form.value.montant

        const { error } = await supabase
            .from('ses_obj')
            .update(payload)
            .eq('id', route.params.id)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            action: `Modification de l'ODM n°${route.params.id}`,
            niv_val: props.niveau,
            cat_proc: 'odm',
            type: 'edit'
        })

        modeEdition.value = false
        showAlert('Modifications enregistrées', 'Succès', 'success')
        await getDemande()
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de l\'enregistrement', 'Oops', 'danger')
    } finally {
        loadingAction.value = false
    }
}

// ====================== CRÉATION ======================
const creerODM = async () => {
    if (!validateForm()) return

    if (!userStore.sup) {
        showAlert('Veuillez définir un supérieur dans votre profil.', 'Oops', 'danger')
        return
    }

    loadingAction.value = true
    try {
        const payload = {
            ...form.value,
            montant: montantCalcule.value,
            id_user: userStore.id,
            id_sup: userStore.sup,
            cat_proc: 'odm',
            date: new Date().toISOString().split('T')[0],
            niv_val: niveauODM.superieur
        }

        const { data: inserted, error } = await supabase
            .from('ses_obj')
            .insert(payload)
            .select('id')
            .single()

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: inserted.id,
            action: `Création de l'ordre de mission n°${inserted.id}`,
            niv_val: niveauODM.superieur,
            cat_proc: 'odm',
            type: 'valider'
        })

        showAlert('Ordre de mission envoyé au supérieur', 'Succès', 'success')
        setTimeout(() => navigateTo(props.retourPath), 800)
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de la création', 'Oops', 'danger')
    } finally {
        loadingAction.value = false
    }
}

// ====================== ACTIONS MÉTIER ======================
const openMotifModal = () => {
    btnOpenMotif.value?.click()
}

const handleAction = async (action) => {
    if (!isAtCurrentLevel.value) {
        showAlert('Cet ordre de mission n\'est pas à votre niveau.', 'Oops', 'danger')
        return
    }
    if (modeEdition.value) return

    if (action.type === 'validate') {
        if (!validateForm()) return
        await doValidate()
        return
    }

    if (action.type === 'reject' || action.type === 'return') {
        if (action.requireMotif) {
            pendingAction.value = action
            motifTexte.value = ''
            openMotifModal()
            return
        }
        pendingAction.value = action
        await confirmMotifAction()
    }
}

const confirmMotifAction = async () => {
    const action = pendingAction.value
    if (!action) return

    if (action.requireMotif && !motifTexte.value.trim()) {
        showAlert('Le motif est obligatoire.', 'Oops', 'danger')
        return
    }

    if (action.type === 'reject') await doReject(motifTexte.value.trim())
    else if (action.type === 'return') await doReturn(action.targetLevel, motifTexte.value.trim())

    const el = document.getElementById('modalMotifOdm')
    el?.querySelector('[data-bs-dismiss="modal"]')?.click()
    pendingAction.value = null
}

const doValidate = async () => {
    loadingAction.value = true
    try {
        const payload = {
            ...buildFormPayload(),
            niv_val: Number(props.niveau) === Number(niveauODM.erg)
                ? niveauODM.superieur
                : resolvedNextLevel.value
        }

        const histType = Number(payload.niv_val) === Number(niveauODM.cheque) ? 'fin' : 'valider'

        const { error } = await supabase
            .from('ses_obj')
            .update(payload)
            .eq('id', route.params.id)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            action: Number(props.niveau) === Number(niveauODM.erg)
                ? `Resoumission de l'ODM n°${route.params.id} au supérieur`
                : `Validation de l'ODM n°${route.params.id}`,
            niv_val: payload.niv_val,
            cat_proc: 'odm',
            type: histType
        })

        showAlert('Ordre de mission validé', 'Succès', 'success')
        setTimeout(() => navigateTo(props.retourPath), 800)
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de la validation', 'Oops', 'danger')
    } finally {
        loadingAction.value = false
    }
}

const doReject = async (motif) => {
    loadingAction.value = true
    try {
        const { error } = await supabase
            .from('ses_obj')
            .update({
                niv_val: niveauODM.refuse,
                motif_rejet: motif || null
            })
            .eq('id', route.params.id)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            action: `Refus de l'ODM n°${route.params.id} - Motif: ${motif}`,
            niv_val: niveauODM.refuse,
            cat_proc: 'odm',
            type: 'rejeter'
        })

        showAlert('Ordre de mission refusé', 'Information', 'warning')
        setTimeout(() => navigateTo(props.retourPath), 800)
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du refus', 'Oops', 'danger')
    } finally {
        loadingAction.value = false
    }
}

const doReturn = async (targetLevel, motif) => {
    const target = targetLevel ?? niveauODM.erg
    loadingAction.value = true
    try {
        const { error } = await supabase
            .from('ses_obj')
            .update({
                niv_val: target,
                motif_rejet: motif || null
            })
            .eq('id', route.params.id)

        if (error) throw error

        await supabase.from('ses_histo2').insert({
            id_user: userStore.id,
            id_obj: route.params.id,
            action: `Retour de l'ODM n°${route.params.id} au collaborateur${motif ? ' - Motif: ' + motif : ''}`,
            niv_val: target,
            cat_proc: 'odm',
            type: 'retour'
        })

        showAlert('Ordre de mission renvoyé au collaborateur', 'Succès', 'success')
        setTimeout(() => navigateTo(props.retourPath), 800)
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors du retour', 'Oops', 'danger')
    } finally {
        loadingAction.value = false
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

onMounted(async () => {
    await listImputation()
    await getDemande()
})
</script>