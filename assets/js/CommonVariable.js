//en tete DA
export const tableTete = [
            { key: 'id', label: 'N°'},
            { key: 'designation', label: 'Désignation' }, 
            { key: 'qte', label: 'Nombre' },
            { key: 'spec', label: 'Spécificités techniques, les références (à bien préciser)' , style: {minWidth: '450px'}},
            { key: 'fournisseur', label: 'Fournisseur possible' },
            { key: 'prix', label: 'PU budgeté' },
            { key: 'delai', label: 'Date de livraison prévue' },
            { key: 'total', label: 'Montant total du budget alloué', style: {minWidth: '300px'} },
            { key: 'num_tiger', label: 'Tiger' },
            { key: 'com', label: 'Commentaire',editable: true, type: 'textarea' , style: {minWidth: '350px'}},
            { key: 'com_sup', label: 'Commentaire du supérieur', style: {minWidth: '350px'}},
            { key: 'motif', label: 'Motif de rejet ',editable: true, type: 'textarea' , style: {minWidth: '350px'}},
        ]

export const niveau = {
    erg: 0,
    superieur: 1,
    achat: 2,
    finance:3,
    cg:4,
    dpr:5,
    afe:6,
    cheque:7,
    livraison:8,
    valide:9,
    refuse:10
}
//DRFMS
// En-tête DRFMS
export const TeteDRFMS = [
    { key: 'type_nom', label: 'Type de soins' },
    { key: 'raison', label: 'Raison et description des soins', style: { minWidth: '350px' } },
    { key: 'date', label: 'Date de soins' },
    { key: 'cachet', label: 'Cachet et signature du médecin prescripteur', style: { minWidth: '350px' } },
    { key: 'cout', label: 'Coût (ar)' },
    { key: 'taux_label', label: 'Taux appliqué' },
    { key: 'pourcentage', label: 'Pourcentage remboursé' },
    { key: 'montant', label: 'Montant à rembourser (ar)' },
]

export const niveauDRFMS ={
    erg:0,
    dpr:1,
    rh:2,
    finance:3,
    cg:4,
    cheque:5,
    valide:6,
    refuse:10
}
//NDF
export const niveauNDF ={
    erg:0,
    superieur: 1,
    finance:2,
    cg:3,
    dpr:4,
    cheque:5,
    valide:6,
    refuse:10
}

//ODM
export const niveauODM ={
    erg:0,
    superieur:1,
    rh:2,
    finance:3,
    cg:4,
    dpr:5,
    cheque:6,
    valide:7,
    refuse:10
}
//bourse
export const niveauBourse ={
    erg:0,
    superieur:1,
    finance:2,
    cg:3,
    dpr:4,
    cheque:5,
    valide:6,
    refuse:10
}
export const TeteBourse = 
        [
            { key: 'num', label: 'N°' },
            { key: 'description', label: 'Description' },
            { key: 'qte', label: 'Nombre' },
            { key: 'prix', label: 'Montant unitaire' },
            { key: 'montant', label: 'Montant' },
            { key: 'observation', label: 'Observation' }
        ]

export const exportColumnsExcel = [
    { key: 'num', label: 'N°' },
    { key: 'description', label: 'Description' },
    { key: 'qte', label: 'Nombre' },
    { key: 'prix', label: 'Montant unitaire' },
    { key: 'montant', label: 'Montant' },
    { key: 'imputation', label: 'Imputation' },
    { key: 'imputation_old', label: 'Ancienne imputation' },
    { key: 'com_sup', label: 'Commentaire supérieur' },
    { key: 'tiger', label: 'Code Tiger' },
    { key: 'num_cheque', label: 'N° Chèque' },
    { key: 'date_cheque', label: 'Date chèque' },
]

//Option nav dans signature
export const navOptionsCommun = [
    { signe:'DA', label: 'Demande d\'achat', value: '/signature',view:true },
    { signe:'DRFMS', label: 'DRFMS', value: '/signature/drfms',view:true },
    { signe:'NDF', label: 'NDF', value: '/signature/ndf',view:true },
    { signe:'ODM', label: 'ODM', value: '/signature/odm',view:true },
    { signe:'BOURSE', label: 'Bourse étudiant', value: '/signature/bourse',view:true }
]
