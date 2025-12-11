<template>
    <div class="purchase_page">
        <!-- Header avec titre et lien de retour -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>DÉTAILS DE LA DEMANDE</h1>
            <button class="btn btn-outline-success" @click="exportToExcel">Exporter vers Excel</button>
            <div class="link_demande">
            </div>
        </div>
        
        <!-- Informations générales de la demande -->
        <div>
            <h6>N° d'enregistrement: <span>{{ route.params.id }}</span></h6>
            <h6>Date: <span>{{ dataObj.date }}</span></h6>
            <h6></h6>
            <div class="d-flex align-items-center gap-3">
                <h6>Objet: <span>{{ dataObj.nom }}</span></h6>
            </div>
        </div>
        
        <!-- Tableau des détails -->
        <div class="table_block_list">
            <Table
                ref="tableRef"
                :columns="columns"
                :rows="demande_details"
                :type_but_modal="true"
                :but_Validation="true"
                :actions="[
                    { label: 'Valider', color: 'success' },
                    { label: 'Rejeter', color: 'secondary' }
                ]"
                @validation_action="handleValidationAction"
                @editable_field_change="handleEditableFieldChange"
                :loading="loading"
            />
        </div>
        <!-- Alert pour les notifications -->
        <Alert v-if="alert.show" :message="alert.message" :type="alert.type" :title="alert.title"/>
    </div>
</template>

<script setup>
import { tableTete,niveau } from '~/assets/js/CommonVariable.js';
import {exportExcel} from '~/assets/js/export.js';
// Services
const supabase = useSupabaseClient()
// Store
const userStore = useUserStore()
const route = useRoute();

//loading
const loading = ref(true);

// Alert system
const alert = ref({
    show: false,
    message: '',
    title: '',
    type: '' // success, error, warning, info
})

// Afficher une alerte
const showAlert = (message, title, type) => {
    alert.value = {
        show: true,
        message,
        title,
        type
    }

    // Auto-hide après 5 secondes
    setTimeout(() => {
        alert.value.show = false
    }, 5000)
}
// Référence vers le composant Table
const tableRef = ref(null);

// Définition des colonnes du tableau
const columns = [
    { key: 'num', label: 'N°'},
    ...tableTete.filter(col => col.key !== 'id'), // Exclure la colonne 'id'
    { 
        key: 'imputation', 
        label: 'Imputation analytique',  
        editable: true, 
        type: 'select', 
        options: [
            {
                "value": "ADMAGIOF",
                "label": "ADMAGIOF"
            },
            {
                "value": "ADMAGIOS",
                "label": "ADMAGIOS"
            },
            {
                "value": "ADMASSFO",
                "label": "ADMASSFO"
            },
            {
                "value": "ADMASSVH",
                "label": "ADMASSVH"
            },
            {
                "value": "ADMAUDIT",
                "label": "ADMAUDIT"
            },
            {
                "value": "ADMBUCLE",
                "label": "ADMBUCLE"
            },
            {
                "value": "ADMCARBS",
                "label": "ADMCARBS"
            },
            {
                "value": "ADMCARBV",
                "label": "ADMCARBV"
            },
            {
                "value": "ADMDENRF",
                "label": "ADMDENRF"
            },
            {
                "value": "ADMDEPLT",
                "label": "ADMDEPLT"
            },
            {
                "value": "ADMEXTRA",
                "label": "ADMEXTRA"
            },
            {
                "value": "ADMFLOTT",
                "label": "ADMFLOTT"
            },
            {
                "value": "ADMMATCU",
                "label": "ADMMATCU"
            },
            {
                "value": "ADMPARKI",
                "label": "ADMPARKI"
            },
            {
                "value": "ADMPOSTE",
                "label": "ADMPOSTE"
            },
            {
                "value": "ADMPRDIM",
                "label": "ADMPRDIM"
            },
            {
                "value": "ADMPSTDI",
                "label": "ADMPSTDI"
            },
            {
                "value": "ADMPUBLI",
                "label": "ADMPUBLI"
            },
            {
                "value": "ADMREPVH",
                "label": "ADMREPVH"
            },
            {
                "value": "APACUTOP",
                "label": "APACUTOP"
            },
            {
                "value": "APAUTFRA",
                "label": "APAUTFRA"
            },
            {
                "value": "APAUTIMP",
                "label": "APAUTIMP"
            },
            {
                "value": "APAUTPST",
                "label": "APAUTPST"
            },
            {
                "value": "APCERNOL",
                "label": "APCERNOL"
            },
            {
                "value": "APCIMTRL",
                "label": "APCIMTRL"
            },
            {
                "value": "APCLBMAT",
                "label": "APCLBMAT"
            },
            {
                "value": "APCLEVE1",
                "label": "APCLEVE1"
            },
            {
                "value": "APCLEVE2",
                "label": "APCLEVE2"
            },
            {
                "value": "APCLLUDC",
                "label": "APCLLUDC"
            },
            {
                "value": "APCLMC27",
                "label": "APCLMC27"
            },
            {
                "value": "APCLMCET",
                "label": "APCLMCET"
            },
            {
                "value": "APCLPRCL",
                "label": "APCLPRCL"
            },
            {
                "value": "APCLVIND",
                "label": "APCLVIND"
            },
            {
                "value": "APCLVOYC",
                "label": "APCLVOYC"
            },
            {
                "value": "APEADMIN",
                "label": "APEADMIN"
            },
            {
                "value": "APEAGIOS",
                "label": "APEAGIOS"
            },
            {
                "value": "APEASIMP",
                "label": "APEASIMP"
            },
            {
                "value": "APEASPST",
                "label": "APEASPST"
            },
            {
                "value": "APEAUELC",
                "label": "APEAUELC"
            },
            {
                "value": "APETBSCP",
                "label": "APETBSCP"
            },
            {
                "value": "APETSHIR",
                "label": "APETSHIR"
            },
            {
                "value": "APEVENMT",
                "label": "APEVENMT"
            },
            {
                "value": "APFRSANT",
                "label": "APFRSANT"
            },
            {
                "value": "APFRSVAC",
                "label": "APFRSVAC"
            },
            {
                "value": "APINTEND",
                "label": "APINTEND"
            },
            {
                "value": "APINTGAZ",
                "label": "APINTGAZ"
            },
            {
                "value": "APMATNET",
                "label": "APMATNET"
            },
            {
                "value": "APREMCER",
                "label": "APREMCER"
            },
            {
                "value": "APRFLIMP",
                "label": "APRFLIMP"
            },
            {
                "value": "APRFLPST",
                "label": "APRFLPST"
            },
            {
                "value": "APSPIBCH",
                "label": "APSPIBCH"
            },
            {
                "value": "APSPIPST",
                "label": "APSPIPST"
            },
            {
                "value": "APSPISOR",
                "label": "APSPISOR"
            },
            {
                "value": "APSTECVF",
                "label": "APSTECVF"
            },
            {
                "value": "APSTECVJ",
                "label": "APSTECVJ"
            },
            {
                "value": "APSTEECT",
                "label": "APSTEECT"
            },
            {
                "value": "APSTEVMO",
                "label": "APSTEVMO"
            },
            {
                "value": "APVADPER",
                "label": "APVADPER"
            },
            {
                "value": "APVSTFOY",
                "label": "APVSTFOY"
            },
            {
                "value": "DPRFRNTS",
                "label": "DPRFRNTS"
            },
            {
                "value": "EQAPDPLT",
                "label": "EQAPDPLT"
            },
            {
                "value": "EQAPIMPR",
                "label": "EQAPIMPR"
            },
            {
                "value": "EQAPSTAG",
                "label": "EQAPSTAG"
            },
            {
                "value": "EQSVADFA",
                "label": "EQSVADFA"
            },
            {
                "value": "EQSVADFO",
                "label": "EQSVADFO"
            },
            {
                "value": "EQUIPSEM",
                "label": "EQUIPSEM"
            },
            {
                "value": "MISFIERE",
                "label": "MISFIERE"
            },
            {
                "value": "PARTAMIS",
                "label": "PARTAMIS"
            },
            {
                "value": "PARTCART",
                "label": "PARTCART"
            },
            {
                "value": "PARTCONX",
                "label": "PARTCONX"
            },
            {
                "value": "PARTDBUS",
                "label": "PARTDBUS"
            },
            {
                "value": "PARTDEPL",
                "label": "PARTDEPL"
            },
            {
                "value": "PARTDINE",
                "label": "PARTDINE"
            },
            {
                "value": "PARTDJNR",
                "label": "PARTDJNR"
            },
            {
                "value": "PARTEVNT",
                "label": "PARTEVNT"
            },
            {
                "value": "PARTFRNT",
                "label": "PARTFRNT"
            },
            {
                "value": "PARTPARK",
                "label": "PARTPARK"
            },
            {
                "value": "PARTPERD",
                "label": "PARTPERD"
            },
            {
                "value": "PARTPLAQ",
                "label": "PARTPLAQ"
            },
            {
                "value": "PARTROL",
                "label": "PARTROL"
            },
            {
                "value": "PARTSIGN",
                "label": "PARTSIGN"
            },
            {
                "value": "PARTSOCO",
                "label": "PARTSOCO"
            },
            {
                "value": "PRESLCT1",
                "label": "PRESLCT1"
            },
            {
                "value": "PRESLCT2",
                "label": "PRESLCT2"
            },
            {
                "value": "PRESLCT3",
                "label": "PRESLCT3"
            },
            {
                "value": "PRESLCT4",
                "label": "PRESLCT4"
            },
            {
                "value": "PRESLCT5",
                "label": "PRESLCT5"
            },
            {
                "value": "PRESLCT6",
                "label": "PRESLCT6"
            },
            {
                "value": "Réunion MDRHE",
                "label": "Réunion MDRHE"
            },
            {
                "value": "SAANTIVR",
                "label": "SAANTIVR"
            },
            {
                "value": "SAASSUBA",
                "label": "SAASSUBA"
            },
            {
                "value": "SABATELC",
                "label": "SABATELC"
            },
            {
                "value": "SABATPOI",
                "label": "SABATPOI"
            },
            {
                "value": "SABATREP",
                "label": "SABATREP"
            },
            {
                "value": "SABATSER",
                "label": "SABATSER"
            },
            {
                "value": "SACARBGR",
                "label": "SACARBGR"
            },
            {
                "value": "SACARBTO",
                "label": "SACARBTO"
            },
            {
                "value": "SACERNOL",
                "label": "SACERNOL"
            },
            {
                "value": "SACOMASC",
                "label": "SACOMASC"
            },
            {
                "value": "SACONNEX",
                "label": "SACONNEX"
            },
            {
                "value": "SADDRFMS",
                "label": "SADDRFMS"
            },
            {
                "value": "SADEJEUN",
                "label": "SADEJEUN"
            },
            {
                "value": "SADEPLAC",
                "label": "SADEPLAC"
            },
            {
                "value": "SADMIFKT",
                "label": "SADMIFKT"
            },
            {
                "value": "SADOCFKT",
                "label": "SADOCFKT"
            },
            {
                "value": "SADONFKT",
                "label": "SADONFKT"
            },
            {
                "value": "SAELECTR",
                "label": "SAELECTR"
            },
            {
                "value": "SAESPORT",
                "label": "SAESPORT"
            },
            {
                "value": "SAFORMAT",
                "label": "SAFORMAT"
            },
            {
                "value": "SAGIOSBQ",
                "label": "SAGIOSBQ"
            },
            {
                "value": "SAHABILL",
                "label": "SAHABILL"
            },
            {
                "value": "SAHABIMP",
                "label": "SAHABIMP"
            },
            {
                "value": "SAIMPRES",
                "label": "SAIMPRES"
            },
            {
                "value": "SAINFOBM",
                "label": "SAINFOBM"
            },
            {
                "value": "SAINFOEN",
                "label": "SAINFOEN"
            },
            {
                "value": "SAINFRPL",
                "label": "SAINFRPL"
            },
            {
                "value": "SAJRDOUT",
                "label": "SAJRDOUT"
            },
            {
                "value": "SAMNGOUT",
                "label": "SAMNGOUT"
            },
            {
                "value": "SAMNGPCB",
                "label": "SAMNGPCB"
            },
            {
                "value": "SAMNGPRD",
                "label": "SAMNGPRD"
            },
            {
                "value": "SAMOBCHE",
                "label": "SAMOBCHE"
            },
            {
                "value": "SAPSTBAR",
                "label": "SAPSTBAR"
            },
            {
                "value": "SAPSTDER",
                "label": "SAPSTDER"
            },
            {
                "value": "SAPSTJAR",
                "label": "SAPSTJAR"
            },
            {
                "value": "SAPSTNET",
                "label": "SAPSTNET"
            },
            {
                "value": "SAPSTSEC",
                "label": "SAPSTSEC"
            },
            {
                "value": "SAPUBAVI",
                "label": "SAPUBAVI"
            },
            {
                "value": "SAREPCHE",
                "label": "SAREPCHE"
            },
            {
                "value": "SAREPGRP",
                "label": "SAREPGRP"
            },
            {
                "value": "SAREPIMP",
                "label": "SAREPIMP"
            },
            {
                "value": "SAREPMEU",
                "label": "SAREPMEU"
            },
            {
                "value": "SAREPMOB",
                "label": "SAREPMOB"
            },
            {
                "value": "SAREPORD",
                "label": "SAREPORD"
            },
            {
                "value": "SAREPSRP",
                "label": "SAREPSRP"
            },
            {
                "value": "SAREPSTB",
                "label": "SAREPSTB"
            },
            {
                "value": "SAREPTON",
                "label": "SAREPTON"
            },
            {
                "value": "SARF2FKT",
                "label": "SARF2FKT"
            },
            {
                "value": "SASEMBCH",
                "label": "SASEMBCH"
            },
            {
                "value": "SASEMGAT",
                "label": "SASEMGAT"
            },
            {
                "value": "SASEMNOE",
                "label": "SASEMNOE"
            },
            {
                "value": "SASEMPER",
                "label": "SASEMPER"
            },
            {
                "value": "SASEMREU",
                "label": "SASEMREU"
            },
            {
                "value": "SASRVEUR",
                "label": "SASRVEUR"
            },
            {
                "value": "SASSURAN",
                "label": "SASSURAN"
            },
            {
                "value": "SATRICOR",
                "label": "SATRICOR"
            },
            {
                "value": "SATRIPRE",
                "label": "SATRIPRE"
            },
            {
                "value": "SATSHIRT",
                "label": "SATSHIRT"
            },
            {
                "value": "SAVADDEP",
                "label": "SAVADDEP"
            },
            {
                "value": "SAVADPER",
                "label": "SAVADPER"
            },
            {
                "value": "SBACSLMD",
                "label": "SBACSLMD"
            },
            {
                "value": "SBADOCUM",
                "label": "SBADOCUM"
            },
            {
                "value": "SBAPCORI",
                "label": "SBAPCORI"
            },
            {
                "value": "SBAPCPRO",
                "label": "SBAPCPRO"
            },
            {
                "value": "SBAPDEFI",
                "label": "SBAPDEFI"
            },
            {
                "value": "SBAREMCE",
                "label": "SBAREMCE"
            },
            {
                "value": "SBASTGDP",
                "label": "SBASTGDP"
            },
            {
                "value": "SBASTGIN",
                "label": "SBASTGIN"
            },
            {
                "value": "SBATRPRO",
                "label": "SBATRPRO"
            },
            {
                "value": "SBATSVAK",
                "label": "SBATSVAK"
            },
            {
                "value": "SBAVSTEE",
                "label": "SBAVSTEE"
            },
            {
                "value": "SBAVSTEN",
                "label": "SBAVSTEN"
            },
            {
                "value": "SBAVSTES",
                "label": "SBAVSTES"
            },
            {
                "value": "SBCOMFLY",
                "label": "SBCOMFLY"
            },
            {
                "value": "SBCOMFRS",
                "label": "SBCOMFRS"
            },
            {
                "value": "SBCOSPFR",
                "label": "SBCOSPFR"
            },
            {
                "value": "SBDEJMIN",
                "label": "SBDEJMIN"
            },
            {
                "value": "SBOSPFRN",
                "label": "SBOSPFRN"
            },
            {
                "value": "SBSANCIE",
                "label": "SBSANCIE"
            },
            {
                "value": "SBSBUSNS",
                "label": "SBSBUSNS"
            },
            {
                "value": "SBSEMEQP",
                "label": "SBSEMEQP"
            },
            {
                "value": "SBSEMPLO",
                "label": "SBSEMPLO"
            },
            {
                "value": "SBSFORUM",
                "label": "SBSFORUM"
            },
            {
                "value": "SBSIMPME",
                "label": "SBSIMPME"
            },
            {
                "value": "SBSPARTO",
                "label": "SBSPARTO"
            },
            {
                "value": "SBSPCPAE",
                "label": "SBSPCPAE"
            },
            {
                "value": "SBSPERDM",
                "label": "SBSPERDM"
            },
            {
                "value": "SBSSALON",
                "label": "SBSSALON"
            },
            {
                "value": "SCLUBALL",
                "label": "SCLUBALL"
            },
            {
                "value": "SDELOFIB",
                "label": "SDELOFIB"
            },
            {
                "value": "SDEMENGT",
                "label": "SDEMENGT"
            },
            {
                "value": "SDIRICKX",
                "label": "SDIRICKX"
            },
            {
                "value": "SECOLAGE",
                "label": "SECOLAGE"
            },
            {
                "value": "SEQPMFOY",
                "label": "SEQPMFOY"
            },
            {
                "value": "SEXTINCT",
                "label": "SEXTINCT"
            },
            {
                "value": "SFRSANTE",
                "label": "SFRSANTE"
            },
            {
                "value": "SFRSBSP",
                "label": "SFRSBSP"
            },
            {
                "value": "SFRSSTAG",
                "label": "SFRSSTAG"
            },
            {
                "value": "SFRSTENU",
                "label": "SFRSTENU"
            },
            {
                "value": "SFRSTRAJ",
                "label": "SFRSTRAJ"
            },
            {
                "value": "SFRSVOYE",
                "label": "SFRSVOYE"
            },
            {
                "value": "SIMPRESS",
                "label": "SIMPRESS"
            },
            {
                "value": "SINTRNET",
                "label": "SINTRNET"
            },
            {
                "value": "SKOLOTAL",
                "label": "SKOLOTAL"
            },
            {
                "value": "SLOYERAB",
                "label": "SLOYERAB"
            },
            {
                "value": "SLOYERFI",
                "label": "SLOYERFI"
            },
            {
                "value": "SLOYERFO",
                "label": "SLOYERFO"
            },
            {
                "value": "SLOYERMJ",
                "label": "SLOYERMJ"
            },
            {
                "value": "SMANUTEN",
                "label": "SMANUTEN"
            },
            {
                "value": "SMATASJA",
                "label": "SMATASJA"
            },
            {
                "value": "SMATEPSA",
                "label": "SMATEPSA"
            },
            {
                "value": "SMATESSA",
                "label": "SMATESSA"
            },
            {
                "value": "SMATESSI",
                "label": "SMATESSI"
            },
            {
                "value": "SMATINFO",
                "label": "SMATINFO"
            },
            {
                "value": "SMATINFP",
                "label": "SMATINFP"
            },
            {
                "value": "SMATIPAC",
                "label": "SMATIPAC"
            },
            {
                "value": "SMATISPM",
                "label": "SMATISPM"
            },
            {
                "value": "SMATSAMI",
                "label": "SMATSAMI"
            },
            {
                "value": "SMATSETS",
                "label": "SMATSETS"
            },
            {
                "value": "SMATSIST",
                "label": "SMATSIST"
            },
            {
                "value": "SMENAGEF",
                "label": "SMENAGEF"
            },
            {
                "value": "SMOBFOYE",
                "label": "SMOBFOYE"
            },
            {
                "value": "SPACHTAB",
                "label": "SPACHTAB"
            },
            {
                "value": "SPACTAGI",
                "label": "SPACTAGI"
            },
            {
                "value": "SPACTCLI",
                "label": "SPACTCLI"
            },
            {
                "value": "SPACTLAN",
                "label": "SPACTLAN"
            },
            {
                "value": "SPAGICDI",
                "label": "SPAGICDI"
            },
            {
                "value": "SPAGITEL",
                "label": "SPAGITEL"
            },
            {
                "value": "SPCOORDO",
                "label": "SPCOORDO"
            },
            {
                "value": "SPCSCCHE",
                "label": "SPCSCCHE"
            },
            {
                "value": "SPCSCFER",
                "label": "SPCSCFER"
            },
            {
                "value": "SPCSCOGS",
                "label": "SPCSCOGS"
            },
            {
                "value": "SPDOCUMT",
                "label": "SPDOCUMT"
            },
            {
                "value": "SPFCEXAM",
                "label": "SPFCEXAM"
            },
            {
                "value": "SPFRNSCO",
                "label": "SPFRNSCO"
            },
            {
                "value": "SPHBTANA",
                "label": "SPHBTANA"
            },
            {
                "value": "SPJRNXQT",
                "label": "SPJRNXQT"
            },
            {
                "value": "SPLANVST",
                "label": "SPLANVST"
            },
            {
                "value": "SPMATLAB",
                "label": "SPMATLAB"
            },
            {
                "value": "SPMEDANI",
                "label": "SPMEDANI"
            },
            {
                "value": "SPMEDOUV",
                "label": "SPMEDOUV"
            },
            {
                "value": "SPPOLEDF",
                "label": "SPPOLEDF"
            },
            {
                "value": "SPPOLEJR",
                "label": "SPPOLEJR"
            },
            {
                "value": "SPPRSTUE",
                "label": "SPPRSTUE"
            },
            {
                "value": "SPSEMEQP",
                "label": "SPSEMEQP"
            },
            {
                "value": "SPTABLRD",
                "label": "SPTABLRD"
            },
            {
                "value": "SPTICBLO",
                "label": "SPTICBLO"
            },
            {
                "value": "SPTICDAC",
                "label": "SPTICDAC"
            },
            {
                "value": "SPTICRES",
                "label": "SPTICRES"
            },
            {
                "value": "SPVISTIC",
                "label": "SPVISTIC"
            },
            {
                "value": "SPVSTCLI",
                "label": "SPVSTCLI"
            },
            {
                "value": "SPVSTCLI",
                "label": "SPVSTCLI"
            },
            {
                "value": "SPVSTCSC",
                "label": "SPVSTCSC"
            },
            {
                "value": "SPVSTIFM",
                "label": "SPVSTIFM"
            },
            {
                "value": "SPVSTTDT",
                "label": "SPVSTTDT"
            },
            {
                "value": "SREPFOYE",
                "label": "SREPFOYE"
            },
            {
                "value": "SSLCONNE",
                "label": "SSLCONNE"
            },
            {
                "value": "SSLDEJEU",
                "label": "SSLDEJEU"
            },
            {
                "value": "SSLDEPLT",
                "label": "SSLDEPLT"
            },
            {
                "value": "SSLDPLAV",
                "label": "SSLDPLAV"
            },
            {
                "value": "SSLLIVRE",
                "label": "SSLLIVRE"
            },
            {
                "value": "SSLPER01",
                "label": "SSLPER01"
            },
            {
                "value": "SSLPER02",
                "label": "SSLPER02"
            },
            {
                "value": "SSLPER03",
                "label": "SSLPER03"
            },
            {
                "value": "SSLPER04",
                "label": "SSLPER04"
            },
            {
                "value": "SSLPER05",
                "label": "SSLPER05"
            },
            {
                "value": "SSLPER06",
                "label": "SSLPER06"
            },
            {
                "value": "SSLPER07",
                "label": "SSLPER07"
            },
            {
                "value": "SSLPER08",
                "label": "SSLPER08"
            },
            {
                "value": "SSLPER09",
                "label": "SSLPER09"
            },
            {
                "value": "SSLPER10",
                "label": "SSLPER10"
            },
            {
                "value": "SSLPER11",
                "label": "SSLPER11"
            },
            {
                "value": "SSLSUJET",
                "label": "SSLSUJET"
            },
            {
                "value": "SSORTIPR",
                "label": "SSORTIPR"
            },
            {
                "value": "SSORTSPI",
                "label": "SSORTSPI"
            },
            {
                "value": "SVIEASSO",
                "label": "SVIEASSO"
            }
            ]
    }
];
// DATA
const dataObj = ref([]);
const demande_details = ref([]);
const validationData = ref(null); // Pour stocker les données de validation pour debug

// METHODES
//recuperation des données
const getDemandeDetails = async () => {
    loading.value = true;
    try {
        const { data, error } = await supabase
            .from('ses_demItems')
            .select('*, fournisseur(nom)')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true });
        
        if (error) throw error;
        
        const allDataView = data.map(item => {
            return {
                ...item,
                fournisseur: item.fournisseur?.nom || '', // récupérer le nom du fournisseur
                etat: item.niv_val == niveau.superieur ? 0 : item.niv_val == niveau.refuse ? 2 : 1,
                delai: formatDate(item.delai), // Formatage de la date en jj/mm/aaaa
            };
        });
        
        demande_details.value = allDataView;
        loading.value = false;
        // Récupération des informations de l'objet
        const { data: demandeObj, error: demandeObjError } = await supabase
            .from('ses_demandeObj')
            .select('*')
            .eq('id', route.params.id)
            .single();
        
        if (demandeObjError) throw demandeObjError;
        
        dataObj.value = {
            ...demandeObj,
            date: formatDate(demandeObj.date),
        };
        
    } catch (error) {
        console.log(error);
        showAlert('Erreur lors de la récupération des détails de la demande.', 'Oops', 'danger');
    }
};

// Gestionnaire principal pour les actions de validation
const handleValidationAction = async (validationPayload) => {
    const { action, item, editableData, rowIndex } = validationPayload;
    
    console.log('Action de validation:', action);
    console.log('Item original:', item);
    console.log('Données éditables:', editableData);
    
    // Stocker pour affichage (debug)
    validationData.value = {
        action: action,
        itemId: item.id,
        originalItem: { ...item },
        editableFields: editableData.fields,
        timestamp: new Date().toISOString()
    };
    
    if (action === 'Valider') {
        await handleValidation(item, editableData);
    } else if (action === 'Rejeter') {
        await handleRejection(item, editableData);
    }
};

// Gestion de la validation
const handleValidation = async (item, editableData) => {
    try {
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: niveau.superieur + 1, // Passer au niveau suivant de validation
            ...editableData.fields // Inclure toutes les données éditables modifiées
        };
        
        // Mettre à jour dans la base de données
        if(editableData.fields.imputation === undefined || editableData.fields.imputation === null || editableData.fields.imputation === ''){
            showAlert('Veuillez sélectionner une imputation analytique avant de valider.', 'Oops', 'danger');
            return;
        }
        const { error } = await supabase
            .from('ses_demItems')
            .update(updateData)
            .eq('id', item.id);

        if (error) throw error;
        
        // Actualiser les données
        await getDemandeDetails();

        // Enregistrement dans historique

        const { error: insertHistError } = await supabase
            .from('ses_histo')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                id_item: item.id,
                action: 'Validation de l\'article '+ item.num + ' dans la demande d\'achat numero ' + route.params.id,
                niv_val: niveau.superieur + 1,
            });

        if (insertHistError) throw insertHistError;
        
        showAlert('Item validé avec succès !', 'Succès', 'success');
        
    } catch (error) {
        console.error('Erreur lors de la validation:', error);
        showAlert('Erreur lors de la validation !', 'Oops', 'danger');
    }
};

// Gestion du rejet
const handleRejection = async (item, editableData) => {
    try {
        console.log('Rejet de l\'item:', item.id);
        console.log('Avec les données éditables:', editableData.fields);
        
        // Préparer les données à mettre à jour
        const updateData = {
            niv_val: niveau.refuse, // Statut rejeté
            ...editableData.fields // Inclure les données éditables (commentaires par exemple)
        };
        
        // Mettre à jour dans la base de données
        const { error } = await supabase
            .from('ses_demItems')
            .update(updateData)
            .eq('id', item.id);
        
        if (error) throw error;
        
        // Actualiser les données
        await getDemandeDetails();
        
        // Enregistrement dans historique

        const { error: insertHistError } = await supabase
            .from('ses_histo')
            .insert({
                id_user: userStore.id,
                id_obj: route.params.id,
                id_item: item.id,
                action: 'Rejet de l\'article '+ item.num + ' dans la demande d\'achat numero ' + route.params.id,
                type: 'rejeter',
                niv_val: niveau.refuse,
            });

        if (insertHistError) throw insertHistError;

        showAlert('Item rejeté avec succès !', 'Succès', 'success');
        
    } catch (error) {
        console.error('Erreur lors du rejet:', error);
        showAlert('Erreur lors du rejet !', 'Oops', 'danger');
    }
};

// Gestionnaire pour les changements de champs éditables (optionnel)
const handleEditableFieldChange = (changeData) => {
    console.log('Changement détecté:', changeData);
    // Vous pouvez faire quelque chose ici si nécessaire (auto-save, validation, etc.)
};

// Méthode pour récupérer toutes les données éditables modifiées (utile pour validation en lot)
const getAllEditableChanges = () => {
    if (tableRef.value) {
        return tableRef.value.getAllEditableData();
    }
    return {};
};


// Méthode pour utilisation dans les methods
const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // les mois commencent à 0
    const year = d.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
};

const exportToExcel = async () => {
    try {
        const { data, error } = await supabase
            .from('ses_demItems')
            .select('*, fournisseur(nom)')
            .eq('id_obj', route.params.id)
            .order('num', { ascending: true });
        
        if (error) throw error;

        // Préparer les données pour l'exportation
        const exportData = data.map(item => ({
            'Num': item.num,
            'Désignation': item.designation,
            'Spécificités techniques': item.spec,
            'Quantité': item.qte,
            'Prix Unitaire': item.prix,
            'Fournisseur': item.fournisseur?.nom || '',
            'Délai': formatDate(item.delai),
            'Imputation Analytique': item.imputation || '',
            'Statut': item.niv_val == niveau.superieur ? 'En attente de votre validation' : item.niv_val == niveau.refuse ? 'Rejeté' : item.niv_val < niveau.superieur ? 'Validation pas encore a votre niveau' : 'Validé',
        }));

        const nameExcel = `Details_de_la_Demande_Num_${route.params.id}`

        await exportExcel(exportData, nameExcel);
        
    } catch (error) {
        console.error('Erreur lors de l\'exportation vers Excel:', error);
        showAlert('Erreur lors de l\'exportation vers Excel.', 'Oops', 'danger');
    }
};

// LIFECYCLE HOOKS
onMounted(() => {
    getDemandeDetails();
});
</script>