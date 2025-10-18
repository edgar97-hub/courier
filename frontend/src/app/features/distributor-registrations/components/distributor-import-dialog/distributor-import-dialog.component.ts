import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import * as XLSX from 'xlsx';

import { DistributorRegistrationService } from '../../services/distributor-registration.service';
import { ImportResult } from '../../../orders/components/order-import-modal/order-import-modal.component';

const EXCEL_COLUMN_MAP: {
  [key: string]: keyof any;
} = {
  'NOMBRE DE CLIENTE': 'clientName',
  DNI: 'clientDni',
  TELÉFONO: 'clientPhone',
  DESTINO: 'destinationAddress',
  OBSERVACION: 'observation',
};
const EXPECTED_HEADERS = Object.keys(EXCEL_COLUMN_MAP);

@Component({
  selector: 'app-distributor-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatListModule,
    MatSnackBarModule,
  ],
  templateUrl: './distributor-import-dialog.component.html',
  styleUrls: ['./distributor-import-dialog.component.scss'],
})
export class DistributorImportDialogComponent {
  private registrationService = inject(DistributorRegistrationService);
  private snackBar = inject(MatSnackBar);
  public dialogRef = inject(MatDialogRef<DistributorImportDialogComponent>);

  selectedFile = signal<File | null>(null);
  isProcessing = signal<boolean>(false);
  importResult = signal<ImportResult | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
      this.importResult.set(null); // Resetear resultados al seleccionar un nuevo archivo
    }
  }

  onDownloadTemplate(): void {
    try {
      // 1. Definir las cabeceras de la plantilla
      const headers = [
        'NOMBRE DE CLIENTE',
        'DNI',
        'TELÉFONO',
        'DESTINO',
        'OBSERVACION',
      ];

      // 2. Crear un array de datos de ejemplo (opcional, pero muy útil para el usuario)
      const exampleData = [
        {
          'NOMBRE DE CLIENTE': 'Juan Pérez García',
          DNI: '12345678',
          TELÉFONO: '987654321',
          DESTINO: 'Av. Javier Prado Este 123, San Isidro, Lima, Perú',
          OBSERVACION: '',
        },
      ];

      // 3. Crear la hoja de cálculo a partir de los datos
      // Primero, creamos una hoja a partir de un array de arrays (cabeceras primero)
      const worksheetData = [
        headers,
        ...exampleData.map((row) => [
          row['NOMBRE DE CLIENTE'],
          row['DNI'],
          row['TELÉFONO'],
          row['DESTINO'],
          row['OBSERVACION'],
        ]),
      ];
      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // 4. (Opcional pero recomendado) Ajustar el ancho de las columnas
      worksheet['!cols'] = [
        { wch: 30 }, // Ancho para 'NOMBRE DE CLIENTE'
        { wch: 15 }, // Ancho para 'DNI'
        { wch: 15 }, // Ancho para 'TELÉFONO'
        { wch: 50 }, // Ancho para 'DESTINO'
        { wch: 50 }, // Ancho para 'DESTINO'
      ];

      // 5. Crear el libro de trabajo y añadir la hoja
      const workbook: XLSX.WorkBook = {
        Sheets: { Registros: worksheet },
        SheetNames: ['Registros'],
      };

      // 6. Generar el archivo y forzar la descarga
      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'plantilla_registros_distribuidor');

      this.snackBar.open('Descargando plantilla...', 'OK', { duration: 2000 });
    } catch (error) {
      console.error('Error al generar la plantilla de Excel:', error);
      this.snackBar.open('Error al generar la plantilla.', 'Cerrar');
    }
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    const a: HTMLAnchorElement = document.createElement('a');
    const url = URL.createObjectURL(data);
    a.href = url;
    a.download = `${fileName}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async processImport(): Promise<void> {
    const file = this.selectedFile();
    if (!file) {
      this.snackBar.open('Por favor, selecciona un archivo Excel.', 'Cerrar');
      return;
    }

    this.isProcessing.set(true);
    this.importResult.set(null);

    try {
      // 1. Leer y parsear el archivo en el frontend
      const parsedData = await this.readFileAndParse(file);
      if (parsedData.length === 0) {
        throw new Error('El archivo Excel no contiene filas de datos válidas.');
      }

      // 2. Enviar el JSON al backend
      this.registrationService
        .importOrdersFromParsedJson(parsedData)
        .subscribe({
          next: (response) => {
            this.importResult.set(response);
            this.isProcessing.set(false);
            if (response.success) {
              this.snackBar.open(response.message, 'OK', { duration: 4000 });
              // Cerramos el diálogo después de un momento y devolvemos 'true' para indicar que se debe recargar la tabla.
              setTimeout(() => this.dialogRef.close(true), 2000);
            }
          },
          error: (err) => {
            const errorMessages = err.error?.message || [
              'Error desconocido del servidor.',
            ];
            this.importResult.set({
              success: false,
              message:
                'El archivo contiene datos inválidos. Por favor, revisa los errores.',
              errors: Array.isArray(errorMessages)
                ? errorMessages.map((msg: string, i: number) => ({
                    row: i + 2,
                    message: msg,
                  })) // Fila 2 en Excel es la primera de datos
                : [{ row: 0, message: errorMessages }],
            });
            this.isProcessing.set(false);
          },
        });
    } catch (error: any) {
      this.importResult.set({ success: false, message: error.message });
      this.isProcessing.set(false);
    }
  }

  private readFileAndParse(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];

          const headers: string[] = (
            (XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
            })[0] as string[]) || []
          ).map((h) => h.trim().toUpperCase());
          const missingHeaders = EXPECTED_HEADERS.filter(
            (h) => !headers.includes(h)
          );
          if (missingHeaders.length > 0) {
            return reject(
              new Error(
                `Cabeceras faltantes o incorrectas en el Excel: ${missingHeaders.join(
                  ', '
                )}`
              )
            );
          }

          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

          const mappedData: any[] = jsonData
            .map((row) => ({
              clientName: row['NOMBRE DE CLIENTE']?.toString().trim() || '',
              clientDni: row['DNI']?.toString().trim() || '',
              clientPhone: row['TELÉFONO']?.toString().trim() || '',
              destinationAddress: row['DESTINO']?.toString().trim() || '',
              observation: row['OBSERVACION']?.toString().trim() || '',
            }))
            .filter(
              (row) =>
                row.clientName ||
                row.clientDni ||
                row.clientPhone ||
                row.destinationAddress ||
                row.observation
            ); // Filtrar filas completamente vacías

          resolve(mappedData);
        } catch (readError) {
          reject(
            new Error(
              'No se pudo leer el archivo Excel. Asegúrate de que el formato sea correcto.'
            )
          );
        }
      };
      reader.onerror = () =>
        reject(new Error('Ocurrió un error al leer el archivo.'));
      reader.readAsBinaryString(file);
    });
  }
}
