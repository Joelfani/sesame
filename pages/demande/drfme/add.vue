<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>NOUVELLE DRFME</h1>
            <div class="link_demande">
                <button class="btn btn-success" @click="sendTableData" :disabled="clickbutsend">
                    Sauvegarder la demande
                </button>
                <NuxtLink to="/demande/drfme" class="btn btn-outline-danger">Annuler</NuxtLink>
            </div>
        </div>
        <!-- Choix du projet : SESAME par défaut, ou Autre avec un texte
             obligatoire. Les deux choix sont exclusifs (boutons radio). -->
        <div class="mt-3 mb-4">
            <label class="fw-bold">Projet <span class="text-danger">*</span></label>
            <div class="d-flex align-items-center gap-4 mt-1">
                <div class="form-check">
                    <input
                        id="projetSesame"
                        v-model="projetChoix"
                        class="form-check-input"
                        type="radio"
                        value="sesame"
                    >
                    <label class="form-check-label" for="projetSesame">SESAME</label>
                </div>
                <div class="form-check">
                    <input
                        id="projetAutre"
                        v-model="projetChoix"
                        class="form-check-input"
                        type="radio"
                        value="autre"
                    >
                    <label class="form-check-label" for="projetAutre">Autre</label>
                </div>
                <!-- Le champ texte n'apparaît que si "Autre" est choisi -->
                <input
                    v-if="projetChoix === 'autre'"
                    v-model="projetAutre"
                    type="text"
                    class="form-control"
                    style="max-width: 300px;"
                    placeholder="Précisez le projet"
                >
            </div>
        </div>

        <div class="table_block_add mt-4">
            <!-- computeRow : appelée par Table à chaque modification d'une
                 ligne, sert à recalculer la part SESAME.
                 funcTotal  : valeur de chaque ligne dans le "Total" affiché
                 en bas (ici la part SESAME). -->
            <Table
                :columns="columns"
                :tableinputadd="true"
                :add-row="true"
                ref="tableRef"
                :totalview="true"
                :computeRow="computeRow"
                :funcTotal="TotalMontant"
            />
        </div>

        <!-- Alert -->
        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />
    </div>
</template>

<script setup>
import { niveauDRFME } from '~/assets/js/CommonVariable.js'

// Services
const supabase = useSupabaseClient()
const currentDate = new Date()
const userStore = useUserStore()

// Alert
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: ''
})

const showAlert = (message, title, type) => {
    alert.value = { show: true, message, title, type }
    setTimeout(() => {
        alert.value.show = false
    }, 5000)
}

// DATA
const tableRef = ref(null)
const clickbutsend = ref(false)

// Projet : 'sesame' par défaut, ou 'autre' avec un texte libre
const projetChoix = ref('sesame')
const projetAutre = ref('')

// Colonnes des lignes.
// `default` : valeur initiale d'une nouvelle ligne (nécessite la petite
// modification de addRowFunction dans Table.vue, voir les explications).
// montant_sesame est désactivée : elle est calculée, jamais saisie.
const columns = computed(() => [
    {
        key: 'num',
        label: 'N°',
        type: 'number',
        min: '1',
        disabled: true,
        style: { height: '62px', width: '80px' }
    },
    {
        key: 'designation',
        label: 'Désignation',
        type: 'textarea',
        style: { height: '62px' }
    },
    {
        key: 'montant_total',
        label: 'Montant total (Ar)',
        type: 'number',
        min: '0',
        style: { width: '150px' }
    },
    {
        key: 'montant_etudiant',
        label: 'Part étudiant (Ar)',
        type: 'number',
        min: '0',
        default: 0,
        style: { width: '150px' }
    },
    {
        key: 'montant_sesame',
        label: 'Part SESAME (Ar)',
        type: 'number',
        disabled: true,
        default: 0,
        style: { width: '150px' }
    },
    {
        key: 'detail',
        label: 'Motif ou destination',
        type: 'textarea',
        style: { height: '62px' }
    },
    {
        key: 'observation',
        label: 'Observation',
        type: 'textarea',
        style: { height: '62px' }
    }
])

// Suppression des espaces et conversion en nombre. Une valeur vide, null
// ou invalide donne 0 : c'est ce qui fait qu'une part étudiant effacée par
// l'utilisateur est traitée comme 0.
const parseNumber = (value) => {
    if (!value) return 0
    return Number(
        String(value)
            .replace(/\s/g, '')
            .replace(',', '.')
    ) || 0
}

// Recalcule la part SESAME d'une ligne (total - part étudiant).
// On n'applique volontairement pas de plancher à 0 : si la part étudiant
// dépasse le total, le résultat négatif reste visible, et l'envoi est de
// toute façon bloqué par la validation de sendTableData.
const computeRow = (row) => {
    row.montant_sesame = parseNumber(row.montant_total) - parseNumber(row.montant_etudiant)
}

// Valeur de chaque ligne dans le "Total" affiché en bas : la part SESAME
const TotalMontant = (row) => {
    return parseNumber(row.montant_sesame)
}

// ====================== ENVOI ======================
const sendTableData = async () => {
    const tableData = tableRef.value?.getTableData() || []

    // Au moins une ligne
    if (tableData.length === 0) {
        showAlert('Veuillez ajouter au moins une ligne à la demande', 'Oups!', 'danger')
        return
    }

    // Projet : si "Autre", le texte est obligatoire
    if (projetChoix.value === 'autre' && !projetAutre.value.trim()) {
        showAlert('Veuillez préciser le projet', 'Oups!', 'danger')
        return
    }

    // Champs obligatoires de chaque ligne : désignation, montant total,
    // motif. La part étudiant n'est jamais "vide" (elle vaut 0 si effacée)
    // et l'observation reste optionnelle.
    const hasEmptyRequired = tableData.some(item =>
        !item.designation?.toString().trim() ||
        !item.detail?.toString().trim() ||
        item.montant_total === null ||
        item.montant_total === undefined ||
        item.montant_total === ''
    )
    if (hasEmptyRequired) {
        showAlert(
            'Veuillez remplir tous les champs obligatoires (Désignation, Montant total, Motif ou destination)',
            'Oups!',
            'danger'
        )
        return
    }

    // Montant total > 0
    if (tableData.some(item => parseNumber(item.montant_total) <= 0)) {
        showAlert('Le montant total doit être supérieur à 0', 'Oups!', 'danger')
        return
    }

    // Part étudiant : jamais négative, jamais supérieure au montant total
    if (tableData.some(item => parseNumber(item.montant_etudiant) < 0)) {
        showAlert('La part étudiant ne peut pas être négative', 'Oups!', 'danger')
        return
    }
    if (tableData.some(item => parseNumber(item.montant_etudiant) > parseNumber(item.montant_total))) {
        showAlert('La part étudiant ne peut pas dépasser le montant total', 'Oups!', 'danger')
        return
    }

    if (clickbutsend.value) return
    clickbutsend.value = true

    try {
        // 1. En-tête dans ses_obj : 'SESAME', ou le texte saisi pour "Autre"
        const projet = projetChoix.value === 'sesame' ? 'SESAME' : projetAutre.value.trim()

        const { data: insertedObj, error: insertObjError } = await supabase
            .from('ses_obj')
            .insert({
                id_user: userStore.id,
                id_sup: userStore.sup,
                cat_proc: 'drfme',
                date: currentDate.toISOString().split('T')[0],
                projet
            })
            .select('id')
            .single()

        if (insertObjError) throw insertObjError

        const insertedId = insertedObj.id

        // 2. Lignes dans ses_items_drfme. La part SESAME est RECALCULÉE ici
        // à partir du total et de la part étudiant : on ne se fie pas à la
        // valeur affichée dans le tableau.
        const insertData = tableData.map((item, index) => {
            const total = parseNumber(item.montant_total)
            const etudiant = parseNumber(item.montant_etudiant)
            return {
                id_obj: insertedId,
                num: item.num || (index + 1),
                designation: item.designation.trim(),
                montant_total: total,
                montant_etudiant: etudiant,
                montant_sesame: total - etudiant,
                detail: item.detail.trim(),
                observation: item.observation?.trim() || null,
                niv_val: niveauDRFME.erg
            }
        })

        const { error: insertItemError } = await supabase
            .from('ses_items_drfme')
            .insert(insertData)

        if (insertItemError) {
            // Si les lignes échouent, on retire l'en-tête déjà créé pour ne
            // pas laisser une demande vide en base (au mieux : on ignore le
            // résultat, l'erreur d'origine est relancée juste après).
            await supabase.from('ses_obj').delete().eq('id', insertedId)
            throw insertItemError
        }

        // 3. Historique. type = 'sauvegarde' (comme la première sauvegarde
        // d'une DRFMS) : ce type ne déclenche aucune notification.
        const { error: histoError } = await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: insertedId,
                action: `Sauvegarde de la DRFME n°${insertedId}`,
                niv_val: niveauDRFME.erg,
                cat_proc: 'drfme',
                type: 'sauvegarde'
            })
        if (histoError) console.error('Erreur historique DRFME:', histoError)

        showAlert('DRFME sauvegardée avec succès', 'Succès', 'success')

        // Redirection
        setTimeout(() => {
            navigateTo('/demande/drfme')
        }, 1000)

    } catch (error) {
        console.error('Erreur lors de l\'envoi de la DRFME:', error)
        showAlert('Erreur lors de l\'envoi de la DRFME', 'Oups!', 'danger')
        clickbutsend.value = false
    }
}
</script>