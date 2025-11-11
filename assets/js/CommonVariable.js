export const tableTete = [
            { key: 'id', label: 'N°'},
            { key: 'designation', label: 'Désignation' }, 
            { key: 'qte', label: 'Nombre' },
            { key: 'spec', label: 'Spécificités techniques, les références (à bien préciser)' , style: {minWidth: '450px'}},
            { key: 'fournisseur', label: 'Fournisseur possible' },
            { key: 'prix', label: 'Prix unitaire (en Ar)' },
            { key: 'delai', label: 'Date de livraison prévue' },
            { key: 'total', label: 'Montant (en Ar)' },
            { key: 'com', label: 'Commentaire ou Motif de rejet',editable: true, type: 'textarea' , style: {minWidth: '350px'}},
        ]
export const niveau = {
    superieur: 1,
    achat: 2,
    afe:3,
    finance:4,
    dpr:5,
    cheque:6,
    livraison:7,
    valide:8,
    refuse:9
}