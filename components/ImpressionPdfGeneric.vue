<template>
    <div class="impression_page">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>{{ titre }}</h1>
            <div>
                <button
                    class="btn btn-outline-success"
                    :disabled="pdfButtonLoading || loading"
                    @click="generatePDF"
                >
                    <span v-if="pdfButtonLoading">Traitement...</span>
                    <span v-else>
                        <img src="/public/icon/print.png" style="width: 20px; height: 20px;" alt="print">
                        Imprimer en PDF
                    </span>
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

        <Alert
            v-if="alert.show"
            :message="alert.message"
            :type="alert.type"
            :title="alert.title"
        />

        <!-- Contenu PDF fourni par le parent -->
        <div v-if="!loading">
            <div id="pdfContent">
                <slot />
            </div>
        </div>
        <div v-else class="text-center py-5 text-muted">
            Chargement...
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    titre: {
        type: String,
        default: 'IMPRESSION'
    },
    retourPath: {
        type: String,
        default: '/signature'
    },
    /** Nom du fichier PDF téléchargé */
    fileName: {
        type: String,
        default: 'Document'
    },
    /** 'l' = paysage, 'p' = portrait */
    orientation: {
        type: String,
        default: 'l'
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const pdfButtonLoading = ref(false)

const alert = ref({ show: false, message: '', title: '', type: '' })
const showAlert = (message, title, type) => {
    alert.value = { show: true, message, title, type }
    setTimeout(() => { alert.value.show = false }, 5000)
}

const generatePDF = async () => {
    pdfButtonLoading.value = true
    try {
        const html2canvas = (await import('html2canvas')).default
        const { jsPDF } = await import('jspdf')

        const element = document.getElementById('pdfContent')
        if (!element) {
            showAlert('Aucun contenu PDF trouvé', 'Erreur', 'danger')
            return
        }

        const pdf = new jsPDF(props.orientation, 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        const pages = element.querySelectorAll('.pdf-page')
        const targets = pages.length ? pages : [element]

        for (let i = 0; i < targets.length; i++) {
            if (i > 0) pdf.addPage()

            const pageElement = targets[i]
            const contentHeight = pageElement.scrollHeight

            const canvas = await html2canvas(pageElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: props.orientation === 'l' ? 1123 : 794,
                windowHeight: contentHeight,
                letterRendering: true,
                dpi: 96,
                y: 0,
                scrollY: -window.scrollY
            })

            const imgData = canvas.toDataURL('image/png')
            const imgProps = pdf.getImageProperties(imgData)

            let imgWidth = pdfWidth
            let imgHeight = (imgProps.height * pdfWidth) / imgProps.width
            const maxAllowedHeight = pdfHeight * 0.95

            let xOffset = 0
            let yOffset = 0

            if (imgHeight > maxAllowedHeight) {
                const scaleFactor = maxAllowedHeight / imgHeight
                imgHeight = maxAllowedHeight
                imgWidth = pdfWidth * scaleFactor
                xOffset = (pdfWidth - imgWidth) / 2
                yOffset = (pdfHeight - imgHeight) / 10
            } else {
                yOffset = (pdfHeight - imgHeight) / 8
            }

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight)
        }

        pdf.save(`${props.fileName}.pdf`)
        showAlert('PDF généré avec succès !', 'Succès', 'success')
    } catch (error) {
        console.error(error)
        showAlert('Erreur lors de la génération du PDF.', 'Oups', 'danger')
    } finally {
        pdfButtonLoading.value = false
    }
}

defineExpose({ generatePDF, showAlert })
</script>

<style scoped>
.impression_page {
    padding: 20px;
    background-color: #f5f5f5;
    min-height: 100vh;
}

#pdfContent {
    margin: 0 auto;
}

@media print {
    .impression_page > div:first-child {
        display: none;
    }

    @page {
        size: A4 landscape;
        margin: 0;
    }
}
</style>

<style>
/* Non scoped : styles des pages PDF dans le slot parent */
.pdf-page {
    width: 1123px;
    padding: 40px;
    background: white;
    margin: 0 auto 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    min-height: 794px;
}

@media print {
    .pdf-page {
        box-shadow: none;
        margin: 0;
        page-break-after: always;
    }
    .pdf-page:last-child {
        page-break-after: auto;
    }
}
</style>