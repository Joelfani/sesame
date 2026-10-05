<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>NOUVELLE DEMANDE DE DEPENSE ETUDIANTE</h1>
            <div class="link_demande d-flex gap-2">
                <NuxtLink to="/demande/bourse" class="btn btn-outline-secondary">
                    Retour
                </NuxtLink>
                <button
                    class="btn btn-success"
                    :disabled="clickbutsend"
                    @click="sendTableData"
                >
                    Enregistrer la demande
                </button>
            </div>
        </div>

        <div>
            <h6>Date : <span>{{ currentDate.toLocaleDateString() }}</span></h6>
            <div class="d-flex align-items-center gap-3 mt-2">
                <h6 class="mb-0">Objet :</h6>
                <input
                    type="text"
                    class="form-control"
                    style="width: 40%; height: 30px;"
                    v-model="objBourse"
                    placeholder="( Ecolage, Trajet Ville, Frais de concours...etc )"
                >
            </div>
        </div>

        <div class="table_block_add mt-4">
            <Table
                :columns="columns"
                :tableinputadd="true"
                :add-row="true"
                :totalDAadd="true"
                :computeRow="computeRowBourse"
                ref="tableRef"
            />
        </div>

        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />
    </div>
</template>

<script setup>
import { niveauBourse } from '~/assets/js/CommonVariable.js'

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
const objBourse = ref('')
const clickbutsend = ref(false)

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
        key: 'description',
        label: 'Description',
        type: 'textarea',
        style: { height: '62px' }
    },
    {
        key: 'qte',
        label: 'Nombre',
        type: 'number',
        min: '1'
    },
    {
        key: 'prix',
        label: 'Montant unitaire',
        type: 'number',
        min: '0',
        placeholder: 'P.U'
    },
    {
        key: 'montant',
        label: 'Montant',
        type: 'number',
        min: '0',
        disabled: true
    },
    {
        key: 'observation',
        label: 'Observation',
        type: 'textarea',
        style: { height: '62px' }
    },
])

// Calcul automatique du montant (appelé par Table à chaque saisie)
const parseNumber = (value) => {
    if (!value) return 0
    return Number(String(value).replace(/\s/g, '').replace(',', '.')) || 0
}

const computeRowBourse = (row) => {
    const qte = parseNumber(row.qte)
    const prix = parseNumber(row.prix)
    row.montant = qte * prix
}

// ====================== ENREGISTREMENT ======================
const sendTableData = async () => {
    if (!objBourse.value.trim()) {
        showAlert('Veuillez renseigner l\'objet de la demande', 'Oups!', 'danger')
        return
    }

    const tableData = tableRef.value?.getTableData() || []

    if (tableData.length === 0) {
        showAlert('Veuillez ajouter au moins une ligne', 'Oups!', 'danger')
        return
    }

    if (tableData.some(item =>
        !item.description?.toString().trim() ||
        item.qte === null || item.qte === undefined || item.qte === '' ||
        item.prix === null || item.prix === undefined || item.prix === ''
    )) {
        showAlert(
            'Veuillez remplir tous les champs obligatoires (Description, Nombre, Montant unitaire)',
            'Oups!',
            'danger'
        )
        return
    }

    if (tableData.some(item => parseNumber(item.qte) <= 0 || parseNumber(item.prix) < 0)) {
        showAlert('Le nombre doit être > 0 et le montant unitaire ≥ 0', 'Oups!', 'danger')
        return
    }

    if (!userStore.sup) {
        showAlert('Veuillez définir un supérieur dans votre profil', 'Oups!', 'danger')
        return
    }

    if (clickbutsend.value) return
    clickbutsend.value = true

    try {
        // En-tête ses_obj (brouillon)
        const { data: insertedObj, error: insertObjError } = await supabase
            .from('ses_obj')
            .insert({
                obj_bourse: objBourse.value.trim(),
                id_user: userStore.id,
                id_sup: userStore.sup,
                date: currentDate.toISOString().split('T')[0],
                cat_proc: 'bourse',
                niv_val: niveauBourse.erg
            })
            .select('id')
            .single()

        if (insertObjError) throw insertObjError

        const insertedId = insertedObj.id

        // Lignes ses_items_bourse
        const insertData = tableData.map((item, index) => {
            const qte = parseNumber(item.qte)
            const prix = parseNumber(item.prix)
            const montant = item.montant !== undefined && item.montant !== ''
                ? parseNumber(item.montant)
                : qte * prix

            return {
                id_obj: insertedId,
                num: item.num || (index + 1),
                description: item.description?.toString().trim() || null,
                qte,
                prix,
                montant,
                observation: item.observation?.toString().trim() || null,
                niv_val: niveauBourse.erg
            }
        })

        const { error: insertItemError } = await supabase
            .from('ses_items_bourse')
            .insert(insertData)
            .select('id')
            
        if (insertItemError) throw insertItemError

        // Historique
        await supabase
        .from('ses_histo2')
        .insert({
            id_user: userStore.id,
            id_obj: insertedId,
            action: `Enregistrement de la demande de bourse n°${insertedId}`,
            niv_val: niveauBourse.erg,
            cat_proc: 'bourse'
        })

        showAlert('Demande de bourse enregistrée avec succès', 'Succès', 'success')

        setTimeout(() => {
            navigateTo('/demande/bourse')
        }, 800)

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error)
        showAlert('Erreur lors de l\'enregistrement', 'Oups!', 'danger')
        clickbutsend.value = false
    }
}
</script>