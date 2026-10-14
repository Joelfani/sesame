//====================== NETTOYAGE NOM FICHIER ======================

export const nettoyerNomFichier = (nom) => {
    // Séparer le nom et l'extension
    const dernierPoint = nom.lastIndexOf('.')

    const nomSansExtension = dernierPoint > 0
        ? nom.slice(0, dernierPoint)
        : nom// Si pas d'extension, on prend tout le nom

    const extension = dernierPoint > 0
        ? nom.slice(dernierPoint).toLowerCase()
        : ''// Si pas d'extension, on met une chaîne vide

    // Nettoyer le nom
    const nomNettoye = nomSansExtension
        .normalize('NFD')// Décomposer les accents
        .replace(/[\u0300-\u036f]/g, '')// Supprimer les accents
        .replace(/[^a-zA-Z0-9_-]+/g, '_')// Remplacer les caractères spéciaux
        .replace(/_+/g, '_')// Éviter les underscores multiples
        .replace(/^_+|_+$/g, '')// Supprimer les underscores aux extrémités

    return (nomNettoye || 'fichier') + extension
}
