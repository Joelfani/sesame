export const exportExcel = async (data, name) => {
        // Utiliser une bibliothèque comme SheetJS pour générer le fichier Excel
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Détails Demande');

        // Générer le fichier Excel et déclencher le téléchargement
        XLSX.writeFile(workbook, `${name}.xlsx`);
}