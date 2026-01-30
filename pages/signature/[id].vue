<template>
    <div class="impression_page">
        <!-- Header avec titre et boutons d'action -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>IMPRESSION DE LA DEMANDE</h1>
            <div class="">
                <button class="btn btn-outline-success" @click="generatePDF" :disabled="pdfButtonLoading">
                    <span v-if="pdfButtonLoading">Traitement...</span>
                    <span v-else>
                        <img src="/public/icon/print.png" style="width: 20px; height: 20px;" alt="print"> 
                        Imprimer en PDF
                    </span>
                </button>
                <NuxtLink :to="`/signature`" class="btn btn-outline-secondary">
                    Retour à la liste
                </NuxtLink>
            </div>
        </div>

        <!-- Alert pour les notifications -->
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>

        <!-- Contenu PDF -->
        <div v-if="pdf">
            <div id="pdfContent">
                <!-- Boucle sur les pages -->
                <div v-for="(page, pageIndex) in paginatedItems" :key="pageIndex" 
                     class="pdf-page" 
                     :style="{ pageBreakAfter: pageIndex < paginatedItems.length - 1 ? 'always' : 'auto' }">
                    
                    <!-- En-tête avec logo -->
                    <div class="d-flex justify-content-between align-items-start" style="margin-bottom: 15px;">
                        <img src="/logo.png" style="width: 90px; height: 85px;">
                        <div style="text-align: left; flex: 1; margin-left: 20px;">
                            <div class="">
                                
                            </div>
                            <!-- Titre du document -->
                            <div style="text-align: center; margin: 15px 0;">
                                <h3 style="font-weight: bold; font-size: 14pt; margin: 0; text-decoration: underline;">DEMANDE D'ACHAT</h3>
                            </div>

                            <!-- Informations générales -->
                            <div style="margin: 15px 170px; font-size: 9pt;">
                                <table>
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #f0f0f0; ">Demandeur :</td>
                                        <td style="border: 1px solid #000; padding: 6px;min-width: 77%;">{{ dataObj.demandeur }}</td>
                                        
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #f0f0f0; ">Date :</td>
                                        <td style="border: 1px solid #000; padding: 6px; ">{{ dataObj.date }}</td>
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #f0f0f0;">N° d'enregistrement :</td>
                                        <td colspan="3" style="border: 1px solid #000; padding: 6px;">{{ route.params.id }}</td>
                                    </tr>
                                    <tr>
                                        <td style="border: 1px solid #000; padding: 6px; font-weight: bold; background-color: #f0f0f0;">Objet :</td>
                                        <td colspan="3" style="border: 1px solid #000; padding: 6px;">{{ dataObj.nom }}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    

                    <!-- Tableau des articles -->
                    <div style="margin: 15px 0;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
                            <thead>
                                <tr style="background-color: #f0f0f0;">
                                    <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 4%;">N°</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: left; width: 20%;">Désignations</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 6%;">Nombre</th>
                                    
                                    <th style="border: 1px solid #000; padding: 5px; text-align: left; width: 13%;">Imputation Analytique</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: left; width: 13%;">Fournisseur possible</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: right; width: 10%;">PU budgété</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: right; width: 10%;">Montant total du budget alloué</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in page.items" :key="item.id">
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;">{{ item.num }}</td>
                                    <td style="border: 1px solid #000; padding: 4px;">{{ item.designation }}</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;">{{ item.qte }}</td>
                                    
                                    <td style="border: 1px solid #000; padding: 4px;">{{ item.imputation }}</td>
                                    <td style="border: 1px solid #000; padding: 4px;">{{ item.fournisseur2 }}</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">{{ formatNumber(item.prixR) }}</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">{{ formatNumber(item.totalR) }}</td>
                                </tr>
                                
                                <!-- Ligne Total (seulement sur la dernière page) -->
                                <tr v-if="pageIndex === paginatedItems.length - 1">
                                    <td colspan="6" style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TOTAL</td>
                                    <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold; font-size: 9pt;">{{ formatNumber(totalMontant) }}</td>
                                    
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Section Signatures (seulement sur la dernière page) -->
                    <div v-if="pageIndex === paginatedItems.length - 1" style="margin-top: 20px;">
                        
                        <!-- Grille de signatures 4 colonnes -->
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 7.5pt;">
                            
                            <!-- Le demandeur -->
                            <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                                <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center;">Le demandeur</p>
                                
                                <div v-if="!dataObj.signatureDemandeur" style="margin-top: 35px;"></div>
                                <img v-else :src="dataObj.signatureDemandeur" alt="Signature Demandeur" style="max-width: 100%; height: 50px; display: block; margin: 10px auto;">
                                
                                <p style="margin: 5px 0 0 0; font-size: 7pt; text-align: center;">{{ dataObj.demandeur }}</p>
                                <p style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;">{{ dataObj.date }}</p>
                            </div>

                            <!-- Le Responsable du Service demandeur -->
                            <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                                <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center; font-size: 7pt;">Le Responsable du Service demandeur</p>
                                
                                <div v-if="!validateurs.superieur?.signatureValide" style="margin-top: 35px;"></div>
                                <img v-else :src="validateurs.superieur.signatureValide" alt="Signature Supérieur" style="max-width: 100%; height: 50px; display: block; margin: 10px auto;">
                                
                                <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">{{ validateurs.superieur?.userValide || 'En attente' }}</p>
                                <p style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;" v-if="validateurs.superieur?.dateVal">{{ validateurs.superieur.dateVal }}</p>
                            </div>

                            <!-- Validation budgétaire par le Département Finance -->
                            <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                                <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center; font-size: 7pt;">Validation budgétaire par le Département Finance</p>
                                
                                <div v-if="!validateurs.finance?.signatureValide" style="margin-top: 35px;"></div>
                                <img v-else :src="validateurs.finance.signatureValide" alt="Signature Finance" style="max-width: 100%; height: 50px; display: block; margin: 10px auto;">
                                
                                <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">{{ validateurs.finance?.userValide || 'En attente' }}</p>
                                <p style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;" v-if="validateurs.finance?.dateVal">{{ validateurs.finance.dateVal }}</p>
                            </div>

                            <!-- Réception par le Service Achat -->
                            <div style="border: 1px solid #999; padding: 8px; min-height: 90px;">
                                <p style="font-weight: bold; margin: 0 0 3px 0; text-align: center; font-size: 7pt;">Réception par le Service Achat</p>
                                
                                <div v-if="!validateurs.achat?.signatureValide" style="margin-top: 35px;"></div>
                                <img v-else :src="validateurs.achat.signatureValide" alt="Signature Achat" style="max-width: 100%; height: 50px; display: block; margin: 10px auto;">
                                
                                <p style="margin: 5px 0 0 0; color: #666; font-size: 7pt; text-align: center;">{{ validateurs.achat?.userValide || 'En attente' }}</p>
                                <p style="margin: 3px 0 0 0; font-size: 6.5pt; text-align: center;" v-if="validateurs.achat?.dateVal">{{ validateurs.achat.dateVal }}</p>
                            </div>

                        </div>
                    </div>

                    <!-- Footer avec numérotation -->
                    <div style="margin-top: 15px; font-size: 7pt; color: #666;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="text-align: left;">
                                
                                <p style="margin: 3px 0 0 0;">Document généré le {{ new Date().toLocaleDateString('fr-FR') }} - Demande N° {{ route.params.id }}</p>
                                
                            </div>
                            <div style="text-align: right;">
                                <p style="margin: 0; float: right;">Association PROMES / Programme SESAME</p>
                            </div>
                            
                            <div v-if="paginatedItems.length > 1" style="text-align: right; font-weight: bold;">
                                Page {{ pageIndex + 1 }} / {{ paginatedItems.length }}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { niveau } from '~/assets/js/CommonVariable.js';

// Services
const supabase = useSupabaseClient()
const route = useRoute();

// Variables réactives
const loading = ref(true);
const pdf = ref(true);
const pdfButtonLoading = ref(false);
const dataObj = ref({
    date: '',
    nom: '',
    demandeur: '',
    superieur: ''
});
const demande_details = ref([]);

// Nombre d'articles par page
const ITEMS_PER_PAGE = 15;

// Stocker les validateurs par niveau
const validateurs = ref({
    superieur: null,  // niv_val 2
    achat: null,      // niv_val 3
    admin: null,      // niv_val 4
    finance: null,    // niv_val 5
    dpr: null,        // niv_val 6
    cheque: null      // niv_val 7
});

// Alert system
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: ''
});

// Computed - Pagination des articles
const paginatedItems = computed(() => {
    const pages = [];
    for (let i = 0; i < demande_details.value.length; i += ITEMS_PER_PAGE) {
        pages.push({
            items: demande_details.value.slice(i, i + ITEMS_PER_PAGE)
        });
    }
    return pages;
});

// Computed - Total
const totalMontant = computed(() => {
    return demande_details.value.reduce((sum, item) => sum + (item.totalR || 0), 0);
});

/* METHODS */

// Afficher une alerte
const showAlert = (message, title, type) => {
    alert.value = {
        show: true,
        message,
        title,
        type
    }
    setTimeout(() => {
        alert.value.show = false
    }, 5000)
}

// Formater les nombres
const formatNumber = (number) => {
    if (!number) return '0';
    return new Intl.NumberFormat('fr-FR').format(number);
}

// Formater la date
const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// Récupération des données
const getDemandeValidee = async () => {
    loading.value = true;
    try {
        // Récupérer les détails de la demande
        const { data: items, error: itemsError } = await supabase
            .from('ses_demItems')
            .select('*, fournisseur2(nom)')
            .eq('id_obj', route.params.id)
            .eq('niv_val', niveau.valide)
            .order('num', { ascending: true });
        
        if (itemsError) throw itemsError;
        
        demande_details.value = items.map(item => ({
            ...item,
            fournisseur2: item.fournisseur2?.nom || '',
        }));
        
        // Récupérer les informations de l'objet et du demandeur
        const { data: demandeObj, error: demandeObjError } = await supabase
            .from('ses_demandeObj')
            .select('*, users:id_user(full_name), sup:id_sup(full_name), demSignature:id_user(signature_url), supSignature:id_sup(signature_url)')
            .eq('id', route.params.id)
            .single();
        
        if (demandeObjError) throw demandeObjError;
        
        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date),
            demandeur: demandeObj.users?.full_name || 'Non spécifié',
            superieur: demandeObj.sup?.full_name || 'Non spécifié',
            signatureDemandeur: demandeObj.demSignature?.signature_url || null,
            signatureSuperieur: demandeObj.supSignature?.signature_url || null
        };

        // Récupération des validateurs avec l'id le plus récent pour chaque niv_val
        if (items.length > 0) {
            const { data: itemsHisto, error: itemsHistoError } = await supabase
                .from('ses_histo')
                .select('id, niv_val, created_at, userValide:id_user(full_name), signatureValide:id_user(signature_url)')
                .eq('id_item', items[0].id)
                .order('niv_val', { ascending: true })
                .order('id', { ascending: false });
            
            if (itemsHistoError) throw itemsHistoError;

            // Grouper par niv_val et garder seulement le plus récent
            const validateursMap = {};
            itemsHisto.forEach(item => {
                if (!validateursMap[item.niv_val]) {
                    validateursMap[item.niv_val] = {
                        niv_val: item.niv_val,
                        dateVal: formatDate(item.created_at),
                        userValide: item.userValide?.full_name || 'Non spécifié',
                        signatureValide: item.signatureValide?.signature_url || null
                    };
                }
            });

            // Mapper aux validateurs correspondants
            validateurs.value = {
                superieur: validateursMap[2] || null,
                achat: validateursMap[3] || null,
                admin: validateursMap[4] || null,
                finance: validateursMap[5] || null,
                dpr: validateursMap[6] || null,
                cheque: validateursMap[7] || null
            };
        }
        
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        showAlert('Erreur lors de la récupération des données', 'Erreur', 'danger');
    } finally {
        loading.value = false;
    }
};

// Génération du PDF en format paysage
const generatePDF = async () => {
    pdfButtonLoading.value = true
    
    try {
        const html2canvas = (await import('html2canvas')).default
        const { jsPDF } = await import('jspdf')

        const element = document.getElementById('pdfContent')
        if (!element) {
            console.error('Aucun élément avec id="pdfContent" trouvé')
            pdfButtonLoading.value = false
            return
        }

        // Créer le PDF en format PAYSAGE
        const pdf = new jsPDF('l', 'mm', 'a4') // 'l' pour landscape (paysage)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        // Traiter chaque page
        const pages = element.querySelectorAll('.pdf-page')
        
        for (let i = 0; i < pages.length; i++) {
            if (i > 0) {
                pdf.addPage()
            }

            const pageElement = pages[i]
            const contentHeight = pageElement.scrollHeight
            
            const canvas = await html2canvas(pageElement, { 
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 1123, // Largeur pour format paysage (A4 = 297mm = ~1123px)
                windowHeight: contentHeight,
                letterRendering: true,
                dpi: 96,
                y: 0,
                scrollY: -window.scrollY
            })
            
            const imgData = canvas.toDataURL('image/png')
            const imgProps = pdf.getImageProperties(imgData)
            
            // Calculer les dimensions
            let imgWidth = pdfWidth
            let imgHeight = (imgProps.height * pdfWidth) / imgProps.width
            
            // Hauteur maximale autorisée (95% de la page)
            const maxAllowedHeight = pdfHeight * 0.95
            
            let xOffset = 0
            let yOffset = 0
            
            if (imgHeight > maxAllowedHeight) {
                // Contenu trop grand : réduire
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
        
        // Sauvegarder le PDF
        const fileName = `Demande_Validee_${route.params.id}.pdf`
        pdf.save(fileName)
        
        showAlert('PDF généré avec succès !', 'Succès', 'success')
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error)
        showAlert('Erreur lors de la génération du PDF.', 'Oups', 'danger')
    } finally {
        pdfButtonLoading.value = false
    }
}

// Lifecycle
onMounted(() => {
    getDemandeValidee();
});
</script>

<style scoped>
.impression_page {
    padding: 20px;
    background-color: #f5f5f5;
    min-height: 100vh;
}

.pdf-page {
    width: 1123px; /* Format A4 paysage */
    padding: 40px;
    background: white;
    margin: 0 auto 20px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    min-height: 794px; /* Hauteur A4 */
}

#pdfContent {
    margin: 0 auto;
}

/* Styles pour l'impression */
@media print {
    .impression_page > div:first-child {
        display: none;
    }
    
    .pdf-page {
        box-shadow: none;
        margin: 0;
        page-break-after: always;
    }
    
    .pdf-page:last-child {
        page-break-after: auto;
    }
    
    @page {
        size: A4 landscape;
        margin: 0;
    }
}
</style>