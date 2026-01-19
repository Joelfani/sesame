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
            <div id="pdfContent" style="width: 794px; padding: 40px; background: white; display: flex; flex-direction: column;">
                <!-- Contenu principal qui prend l'espace disponible -->
                <div style="flex: 1;">
                    
                    <!-- En-tête avec logo -->
                    <div class="d-flex justify-content-between align-items-start" style="margin-bottom: 15px;">
                        <img src="/logo.png" style="width: 90px; height: 85px;">
                        <div style="text-align: right; flex: 1; margin-left: 20px;">
                            <p style="font-size: 11pt; margin: 0; font-weight: bold;">Association PROMotion Economique et Sociale (PROMES)</p>
                            <p style="font-size: 9pt; margin: 5px 0 0 0;">Programme SESAME</p>
                        </div>
                    </div>

                    <!-- Titre du document -->
                    <div style="text-align: center; margin: 15px 0;">
                        <h3 style="font-weight: bold; font-size: 14pt; margin: 0; text-decoration: underline;">DEMANDE D'ACHAT</h3>
                    </div>

                    <!-- Informations générales -->
                    <div style="margin: 15px 0; font-size: 10pt;">
                        <div style="margin-bottom: 8px;">
                            <span style="font-weight: bold;">N° d'enregistrement :</span>
                            <span style="border-bottom: 1px solid #000; display: inline-block; min-width: 180px; padding: 2px 5px;">{{ route.params.id }}</span>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <span style="font-weight: bold;">Date de la demande :</span>
                            <span style="border-bottom: 1px solid #000; display: inline-block; min-width: 180px; padding: 2px 5px;">{{ dataObj.date }}</span>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <span style="font-weight: bold;">Demandeur :</span>
                            <span style="border-bottom: 1px solid #000; display: inline-block; min-width: 380px; padding: 2px 5px;">{{ dataObj.demandeur }}</span>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <span style="font-weight: bold;">Objet :</span>
                            <span style="border-bottom: 1px solid #000; display: inline-block; min-width: 480px; padding: 2px 5px;">{{ dataObj.nom }}</span>
                        </div>
                    </div>

                    <!-- Tableau des articles -->
                    <div style="margin: 15px 0;">
                        <h5 style="font-weight: bold; font-size: 11pt; margin-bottom: 8px;">DÉTAILS DES ARTICLES</h5>
                        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt;">
                            <thead>
                                <tr style="background-color: #f0f0f0;">
                                    <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 5%;">N°</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: left; width: 30%;">Désignation</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 7%;">Qté</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: right; width: 12%;">Prix Unit.</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: right; width: 12%;">Montant</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: left; width: 17%;">Fournisseur</th>
                                    <th style="border: 1px solid #000; padding: 5px; text-align: left; width: 17%;">Imputation</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in demande_details" :key="item.id">
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;">{{ item.num }}</td>
                                    <td style="border: 1px solid #000; padding: 4px;">{{ item.designation }}</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: center;">{{ item.qte }}</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: right;">{{ formatNumber(item.prixR) }}</td>
                                    <td style="border: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">{{ formatNumber(item.totalR) }}</td>
                                    <td style="border: 1px solid #000; padding: 4px;">{{ item.fournisseur2 }}</td>
                                    <td style="border: 1px solid #000; padding: 4px;">{{ item.imputation }}</td>
                                </tr>
                                <!-- Ligne Total -->
                                <tr style="background-color: #f8f8f8; font-weight: bold;">
                                    <td colspan="4" style="border: 1px solid #000; padding: 6px; text-align: right;">MONTANT TOTAL :</td>
                                    <td style="border: 1px solid #000; padding: 6px; text-align: right; font-size: 10pt;">{{ formatNumber(totalMontant) }} Ar</td>
                                    <td colspan="2" style="border: 1px solid #000; padding: 6px;"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Section Signatures -->
                    <div style="margin-top: 20px;">
                        <h5 style="font-weight: bold; font-size: 10pt; margin-bottom: 12px; text-align: center;">SIGNATURES ET VALIDATIONS</h5>
                        
                        <!-- Grille de signatures 3 colonnes -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 7.5pt;">
                            
                            <!-- Demandeur -->
                            <div style="border: 1px solid #999; padding: 8px; min-height: 70px;">
                                <p style="font-weight: bold; margin: 0 0 3px 0;">Le demandeur</p>
                                <p style="margin: 0; font-size: 7pt;">{{ dataObj.demandeur }}</p>
                                
                                <div v-if="!dataObj.signatureDemandeur" style="margin-top: 25px; border-top: 1px solid #000; padding-top: 3px;"></div>
                                <img v-else :src="dataObj.signatureDemandeur" alt="Signature Demandeur" style="max-width: 130px; height: 60px;">
                                
                                <p style="margin: 0; font-size: 6.5pt;">Le {{ dataObj.date }}</p>
                            </div>

                            <!-- Supérieur Hiérarchique - niv_val 2 -->
                            <div style="border: 1px solid #999; padding: 8px; min-height: 70px;">
                                <p style="font-weight: bold; margin: 0 0 3px 0;">Le Responsable du Service demandeur</p>
                                <p style="margin: 0; color: #666; font-size: 7pt;">{{ validateurs.superieur?.userValide || 'En attente' }}</p>
                                
                                <div v-if="!validateurs.superieur?.signatureValide" style="margin-top: 25px; border-top: 1px solid #000; padding-top: 3px;"></div>
                                <img v-else :src="validateurs.superieur.signatureValide" alt="Signature Supérieur" style="max-width: 130px; height: 60px;">
                                
                                <p style="margin: 0; font-size: 6.5pt;" v-if="validateurs.superieur?.dateVal">Le {{ validateurs.superieur.dateVal }}</p>
                            </div>

                            <!-- Responsable Finance - niv_val 5 -->
                            <div style="border: 1px solid #999; padding: 8px; min-height: 70px;">
                                <p style="font-weight: bold; margin: 0 0 3px 0;">Validation budgétaire par le Département Finance</p>
                                <p style="margin: 0; color: #666; font-size: 7pt;">{{ validateurs.finance?.userValide || 'En attente' }}</p>
                                
                                <div v-if="!validateurs.finance?.signatureValide" style="margin-top: 25px; border-top: 1px solid #000; padding-top: 3px;"></div>
                                <img v-else :src="validateurs.finance.signatureValide" alt="Signature Finance" style="max-width: 130px; height: 60px;">
                                
                                <p style="margin: 0; font-size: 6.5pt;" v-if="validateurs.finance?.dateVal">Le {{ validateurs.finance.dateVal }}</p>
                            </div>

                            <!-- Responsable Achat - niv_val 3 -->
                            <div style="border: 1px solid #999; padding: 8px; min-height: 70px;">
                                <p style="font-weight: bold; margin: 0 0 3px 0;">Réception par le Service Achat</p>
                                <p style="margin: 0; color: #666; font-size: 7pt;">{{ validateurs.achat?.userValide || 'En attente' }}</p>
                                
                                <div v-if="!validateurs.achat?.signatureValide" style="margin-top: 25px; border-top: 1px solid #000; padding-top: 3px;"></div>
                                <img v-else :src="validateurs.achat.signatureValide" alt="Signature Achat" style="max-width: 130px; height: 60px;">
                                
                                <p style="margin: 0; font-size: 6.5pt;" v-if="validateurs.achat?.dateVal">Le {{ validateurs.achat.dateVal }}</p>
                            </div>

                            <!-- Responsable Administratif - niv_val 4 
                            <div style="border: 1px solid #999; padding: 8px; min-height: 70px;">
                                <p style="font-weight: bold; margin: 0 0 3px 0;">RESPONSABLE ADMIN.</p>
                                <p style="margin: 0; color: #666; font-size: 7pt;">{{ validateurs.admin?.userValide || 'En attente' }}</p>
                                
                                <div v-if="!validateurs.admin?.signatureValide" style="margin-top: 25px; border-top: 1px solid #000; padding-top: 3px;"></div>
                                <img v-else :src="validateurs.admin.signatureValide" alt="Signature Admin" style="max-width: 130px; height: 60px;">
                                
                                <p style="margin: 0; font-size: 6.5pt;" v-if="validateurs.admin?.dateVal">Le {{ validateurs.admin.dateVal }}</p>
                            </div>-->

                            

                            <!-- Directeur du Programme - niv_val 6 
                            <div style="border: 1px solid #999; padding: 8px; min-height: 70px;">
                                <p style="font-weight: bold; margin: 0 0 3px 0;">DIRECTEUR PROGRAMME</p>
                                <p style="margin: 0; color: #666; font-size: 7pt;">{{ validateurs.dpr?.userValide || 'En attente' }}</p>
                                
                                <div v-if="!validateurs.dpr?.signatureValide" style="margin-top: 25px; border-top: 1px solid #000; padding-top: 3px;"></div>
                                <img v-else :src="validateurs.dpr.signatureValide" alt="Signature DPR" style="max-width: 130px; height: 60px;">
                                
                                <p style="margin: 0; font-size: 6.5pt;" v-if="validateurs.dpr?.dateVal">Le {{ validateurs.dpr.dateVal }}</p>
                            </div>-->

                            <!-- Émetteur du chèque - niv_val 7 (pleine largeur) 
                            <div style="border: 1px solid #999; padding: 8px; min-height: 70px; grid-column: 1 / -1;">
                                <p style="font-weight: bold; margin: 0 0 3px 0;">ÉMETTEUR DU CHÈQUE</p>
                                <p style="margin: 0; color: #666; font-size: 7pt;">{{ validateurs.cheque?.userValide || 'En attente' }}</p>
                                
                                <div v-if="!validateurs.cheque?.signatureValide" style="margin-top: 25px; border-top: 1px solid #000; padding-top: 3px; max-width: 280px;"></div>
                                <img v-else :src="validateurs.cheque.signatureValide" alt="Signature Chèque" style="max-width: 200px; height: 60px;">
                                
                                <p style="margin: 0; font-size: 6.5pt;" v-if="validateurs.cheque?.dateVal">Le {{ validateurs.cheque.dateVal }}</p>
                            </div>-->

                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="margin-top: 15px; font-size: 7pt; color: #666; text-align: center;">
                        <p style="margin: 0;">Association PROMES / Programme SESAME</p>
                        <p style="margin: 3px 0 0 0;">Document généré le {{ new Date().toLocaleDateString('fr-FR') }} - Demande N° {{ route.params.id }}</p>
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

// Computed
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
                .order('id', { ascending: false }); // Trier par id décroissant pour avoir le plus récent en premier
            
            if (itemsHistoError) throw itemsHistoError;

            // Grouper par niv_val et garder seulement le plus récent (premier dans la liste triée)
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

            console.log('Validateurs par niveau:', validateurs.value);
        }
        
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        showAlert('Erreur lors de la récupération des données', 'Erreur', 'danger');
    } finally {
        loading.value = false;
    }
};

// Génération du PDF avec auto-fit comme dans le bon de commande
const generatePDF = async () => {
    pdfButtonLoading.value = true
    
    try {
        // Import dynamique
        const html2canvas = (await import('html2canvas')).default
        const { jsPDF } = await import('jspdf')

        const element = document.getElementById('pdfContent')
        if (!element) {
            console.error('Aucun élément avec id="pdfContent" trouvé')
            pdfButtonLoading.value = false
            return
        }

        // Créer le PDF
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        // Mesurer la hauteur réelle du contenu
        const contentHeight = element.scrollHeight
        
        // Capturer l'élément
        const canvas = await html2canvas(element, { 
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: 794,
            windowHeight: contentHeight,
            letterRendering: true,
            dpi: 96,
            y: 0,
            scrollY: 0
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
            // Contenu trop grand : réduire pour faire rentrer dans 95% de la page
            const scaleFactor = maxAllowedHeight / imgHeight
            imgHeight = maxAllowedHeight
            imgWidth = pdfWidth * scaleFactor
            
            // Centrer horizontalement
            xOffset = (pdfWidth - imgWidth) / 2
            
            // Petit offset du haut
            yOffset = (pdfHeight - imgHeight) / 10
        } else {
            // Taille OK : léger offset du haut
            yOffset = (pdfHeight - imgHeight) / 8
        }
        
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight)
        
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

#pdfContent {
    margin: 0 auto;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

/* Styles pour l'impression */
@media print {
    .impression_page > div:first-child {
        display: none;
    }
    
    #pdfContent {
        box-shadow: none;
        margin: 0;
    }
    
    @page {
        size: A4;
        margin: 0;
    }
}
</style>