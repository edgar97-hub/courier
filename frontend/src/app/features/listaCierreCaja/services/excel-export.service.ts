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
    const columnWidths = this.calculateColumnWidths(worksheet);
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

  public exportCashMovementSummaryAndDetailsToExcel(
    summaryData: any[],
    movementData: any[],
    excelFileName: string,
    sheetName: string = 'Movimientos de Caja'
  ): void {
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]); // Create empty sheet

    let rowIndex = 1;

    // Initialize !merges if it doesn't exist
    if (!worksheet['!merges']) {
      worksheet['!merges'] = [];
    }

    // Add main title
    worksheet['!merges'].push({
      s: { r: rowIndex - 1, c: 0 },
      e: { r: rowIndex - 1, c: 3 },
    });
    worksheet['A' + rowIndex] = {
      v: 'Movimientos de Caja',
      t: 's',
      s: { font: { bold: true, sz: 14 } },
    };
    rowIndex++;
    rowIndex++; // Empty row

    // Add summary details (Fecha Inicio, Fecha Fin)
    summaryData.slice(0, 2).forEach((row) => {
      worksheet['A' + rowIndex] = { v: row.label, t: 's' };
      worksheet['C' + rowIndex] = { v: row.value, t: 's' };
      rowIndex++;
    });
    rowIndex++; // Empty row

    // Extract payment method summaries
    const paymentMethodSummaries = summaryData.slice(2, -3);

    // Get payment method names for headers
    const paymentMethodNames = paymentMethodSummaries.map((s) => s.Tipo);

    // Add payment method headers horizontally
    let colIndex = 1; // Start from column B
    worksheet['A' + rowIndex] = { v: '', t: 's' }; // Empty cell for the first column
    paymentMethodNames.forEach((name) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex - 1, c: colIndex });
      worksheet[cellRef] = { v: name, t: 's', s: { font: { bold: true } } };
      colIndex++;
    });
    rowIndex++;

    // Add "Ingreso" row
    colIndex = 0;
    worksheet['A' + rowIndex] = {
      v: 'Ingreso',
      t: 's',
      s: { font: { bold: true } },
    };
    colIndex++;
    paymentMethodSummaries.forEach((s) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex - 1, c: colIndex });
      worksheet[cellRef] = { v: parseFloat(s.Ingreso), t: 'n' };
      colIndex++;
    });
    rowIndex++;

    // Add "Egreso" row
    colIndex = 0;
    worksheet['A' + rowIndex] = {
      v: 'Egreso',
      t: 's',
      s: { font: { bold: true } },
    };
    colIndex++;
    paymentMethodSummaries.forEach((s) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex - 1, c: colIndex });
      worksheet[cellRef] = { v: parseFloat(s.Egreso), t: 'n' };
      colIndex++;
    });
    rowIndex++;

    // Add "Saldo" row
    colIndex = 0;
    worksheet['A' + rowIndex] = {
      v: 'Saldo',
      t: 's',
      s: { font: { bold: true } },
    };
    colIndex++;
    paymentMethodSummaries.forEach((s) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex - 1, c: colIndex });
      worksheet[cellRef] = { v: parseFloat(s.Saldo), t: 'n' };
      colIndex++;
    });
    rowIndex++;
    rowIndex++; // Empty row

    // Add total summary
    summaryData.slice(-3).forEach((row) => {
      // Only totals
      if (!worksheet['!merges']) {
        worksheet['!merges'] = [];
      }
      worksheet['!merges'].push({
        s: { r: rowIndex - 1, c: 0 },
        e: { r: rowIndex - 1, c: 2 },
      });
      worksheet['A' + rowIndex] = {
        v: row.label,
        t: 's',
        s: { font: { bold: true } },
      };
      worksheet['C' + rowIndex] = {
        v: 'S/',
        t: 's',
        s: { font: { bold: true } },
      };
      worksheet['D' + rowIndex] = {
        v: row.value,
        t: 'n',
        s: { font: { bold: true } },
      };
      rowIndex++;
    });
    rowIndex++; // Empty row
    rowIndex++; // Empty row

    // Add movements table header
    const movementHeaders = Object.keys(movementData[0] || {});
    XLSX.utils.sheet_add_aoa(worksheet, [movementHeaders], {
      origin: `A${rowIndex}`,
    });
    worksheet['A' + rowIndex].s = { font: { bold: true } }; // Apply bold to the first header cell
    rowIndex++;

    // Add movements data
    XLSX.utils.sheet_add_json(worksheet, movementData, {
      origin: `A${rowIndex}`,
      skipHeader: true,
    });
    // Set column widths for the entire sheet
    const columnWidths = this.calculateColumnWidths(worksheet);
    // Set column A width to be very small
    if (columnWidths[0]) {
      columnWidths[0].wch = 5; // Set a small width, e.g., 5 characters
    } else {
      columnWidths.unshift({ wch: 5 }); // If column A doesn't exist yet, add it
    }
    console.log('columnWidths', columnWidths);
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
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

  // Updated function to calculate widths from a worksheet
  private calculateColumnWidths(worksheet: XLSX.WorkSheet): any[] {
    const columnWidths: any[] = [];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
    }) as any[][]; // Ensure data is treated as array of arrays

    data.forEach((row: any[]) => {
      row.forEach((cell: any, colIndex: number) => {
        const cellValue = String(cell || '');
        const currentWidth = columnWidths[colIndex]
          ? columnWidths[colIndex].wch
          : 0;
        if (cellValue.length > currentWidth) {
          columnWidths[colIndex] = { wch: cellValue.length + 2 }; // +2 for padding
        }
      });
    });
    return columnWidths;
  }
}
