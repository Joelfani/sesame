export const tableTete = [
            { key: 'id', label: 'N°'},
            { key: 'designation', label: 'Désignation' }, 
            { key: 'qte', label: 'Nombre' },
            { key: 'spec', label: 'Spécificités techniques, les références (à bien préciser)' , style: {minWidth: '450px'}},
            { key: 'fournisseur', label: 'Fournisseur possible' },
            { key: 'prix', label: 'PU budgeté' },
            { key: 'delai', label: 'Date de livraison prévue' },
            { key: 'total', label: 'Montant total du budget alloué', style: {minWidth: '300px'} },
            { key: 'com', label: 'Commentaire',editable: true, type: 'textarea' , style: {minWidth: '350px'}},
            { key: 'com_sup', label: 'Commentaire du supérieur', style: {minWidth: '350px'}},
            { key: 'motif', label: 'Motif de rejet ',editable: true, type: 'textarea' , style: {minWidth: '350px'}},
        ]
export const niveau = {
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