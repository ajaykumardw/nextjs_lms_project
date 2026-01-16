import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = ({
    headers,
    rows,
    fileName = "report.xlsx",
    sheetName = "Report",
}) => {
    if (!rows || rows.length === 0) return;

    const worksheetData = [
        headers.map(h => h.label),
        ...rows.map(row =>
            headers.map(h => row[h.key] ?? "")
        ),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
    });

    saveAs(blob, fileName);
};
