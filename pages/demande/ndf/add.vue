<template>
    <div class="purchase_page">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>NOUVELLE NOTE DE FRAIS</h1>
            <div class="link_demande">
                <button class="btn btn-success" @click="sendTableData" :disabled="clickbutsend">
                    Sauvegarder la demande
                </button>
                <NuxtLink to="/demande/ndf" class="btn btn-outline-danger">Annuler</NuxtLink>
            </div>
        </div>

        <div>
            <h6>Date : <span>{{ currentDate.toLocaleDateString() }}</span></h6>
        </div>

        <div class="table_block_add mt-4">
            <Table
                :columns="columns"
                :tableinputadd="true"
                :add-row="true"
                ref="tableRef"
                :totalview="true"
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
import { niveauNDF } from '~/assets/js/CommonVariable.js'

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
        label: 'Libellé de facture / Commentaires',
        type: 'textarea',
        style: { height: '62px' }
    },
    {
        key: 'nature',
        label: 'Nature de la dépense',
        type: 'text'
    },
    {
        key: 'ok',
        label: 'OK/NOK',
        type: 'select',
        options: [
            { value: 'OK', label: 'OK' },
            { value: 'NOK', label: 'NOK' }
        ],
    },
    {
        key: 'montant',
        label: 'Montant (Ar)',
        type: 'number',
        min: '0',
        style: { width: '150px' }
    }
])

// ====================== ENVOI ======================
const sendTableData = async () => {
    const tableData = tableRef.value?.getTableData() || []

    // Au moins une ligne
    if (tableData.length === 0) {
        showAlert('Veuillez ajouter au moins une ligne à la note de frais', 'Oups!', 'danger')
        return
    }

    // Tous les champs obligatoires sauf "nature"
    const hasEmptyRequired = tableData.some(item =>
        !item.description?.toString().trim() ||
        item.montant === null ||
        item.montant === undefined ||
        item.montant === '' ||
        item.ok === null ||
        item.ok === undefined ||
        item.ok === ''
    )

    if (hasEmptyRequired) {
        showAlert(
            'Veuillez remplir tous les champs obligatoires (Libellé de facture / Commentaires , Montant, OK/NOK)',
            'Oups!',
            'danger'
        )
        return
    }

    // Montant > 0
    if (tableData.some(item => Number(item.montant) <= 0)) {
        showAlert('Le montant doit être supérieur à 0', 'Oups!', 'danger')
        return
    }

    if (clickbutsend.value) return
    clickbutsend.value = true

    try {
        // 1. Insertion de l'en-tête dans ses_obj
        const { data: insertedObj, error: insertObjError } = await supabase
            .from('ses_obj')
            .insert({
                id_user: userStore.id,
                id_sup: userStore.sup,
                cat_proc: 'ndf',
                date: currentDate.toISOString().split('T')[0],
            })
            .select('id')
            .single()

        if (insertObjError) throw insertObjError

        const insertedId = insertedObj.id

        // 2. Préparation des lignes
        const insertData = tableData.map((item, index) => ({
            id_obj: insertedId,
            num: item.num || (index + 1),
            description: item.description?.trim() || null,
            nature: item.nature?.trim() || null,
            montant: Number(item.montant),
            niv_val: niveauNDF.erg
        }))

        // 3. Insertion des lignes
        const { error: insertItemError } = await supabase
            .from('ses_items_ndf')
            .insert(insertData)

        if (insertItemError) throw insertItemError

        // 4. Historique
        await supabase
            .from('ses_histo2')
            .insert({
                id_user: userStore.id,
                id_obj: insertedId,
                action: `Sauvegarde de la note de frais n°${insertedId}`,
                niv_val: niveauNDF.erg,
                cat_proc: 'ndf'
            })

        showAlert('Note de frais sauvegarder avec succès', 'Succès', 'success')

        // Redirection
        setTimeout(() => {
            navigateTo('/demande/ndf') 
        }, 1000)

    } catch (error) {
        console.error('Erreur lors de l\'envoi de la note de frais:', error)
        showAlert('Erreur lors de l\'envoi de la note de frais', 'Oups!', 'danger')
        clickbutsend.value = false
    }
}

// Suppression des espaces et conversion en nombre pour les champs numériques
const parseNumber = (value) => {
    if (!value) return 0;

    return Number(
        String(value)
            .replace(/\s/g, '')
            .replace(',', '.')
    ) || 0;
};

//calcule des total des montants à rembourser
const TotalMontant = (row) => {
    return parseNumber(row.montant);
};

// ====================== LIFECYCLE ======================
onMounted(() => {
    // rien de particulier à charger pour l’instant
})
</script>