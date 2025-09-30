import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

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
}
