import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx'; // Importar todo el namespace como XLSX

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-TFG-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  constructor() {}

  public exportAsExcelFile(
    jsonData: any[],
    excelFileName: string,
    sheetName: string = 'Sheet1'
  ): void {
    if (!jsonData || jsonData.length === 0) {
      console.warn('No data provided for Excel export.');
      return;
    }

    // Crear el worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);

    // Opcional: Ajustar anchos de columnas (esto es un poco más avanzado y a veces no perfecto)
    // Podrías necesitar una función para calcular anchos basados en el contenido
    const columnWidths = this.calculateColumnWidths(jsonData);
    worksheet['!cols'] = columnWidths;

    // Crear el workbook
    const workbook: XLSX.WorkBook = {
      Sheets: { [sheetName]: worksheet },
      SheetNames: [sheetName],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = `${fileName}${EXCEL_EXTENSION}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Función de ejemplo para calcular anchos (simplificada)
  private calculateColumnWidths(jsonData: any[]): any[] {
    if (!jsonData || jsonData.length === 0) return [];
    const widths: any[] = [];
    const header = Object.keys(jsonData[0]);
    header.forEach((key) => {
      const maxLength = Math.max(
        key.length,
        ...jsonData.map((item) => (item[key] ? String(item[key]).length : 0))
      );
      // widths.push({ wch: maxLength + 2 }); // +2 para un poco de padding
      widths.push({ wch: maxLength + 1 });
    });
    return widths;
  }
}
