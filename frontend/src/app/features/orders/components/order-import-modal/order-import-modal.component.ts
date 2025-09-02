import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Para el loading
import { MatListModule } from '@angular/material/list'; // Para mostrar errores
import { MatTooltipModule } from '@angular/material/tooltip'; // Para tooltips
import * as XLSX from 'xlsx'; // Para leer Excel (npm install xlsx)
import { OrderService } from '../../services/order.service'; // Asume que tienes un método aquí
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order_importacion, STATES } from '../../models/order.model'; // Importa tu modelo Order y STATES
import { SettingsService } from '../../../settings/services/settings.service';
import { Subject, takeUntil } from 'rxjs';

const EXCEL_COLUMN_MAP: { [key: string]: keyof Order_importacion | null } = {
  'TIPO DE ENVIO': 'type_order_transfer_to_warehouse',
  'NOMBRE DEL DESTINATARIO': 'recipient_name',
  'TELEFONO DESTINATARIO 9 DIGITOS': 'recipient_phone',
  DISTRITO: 'delivery_district_name', // Asumimos que el usuario selecciona de una lista validada
  'DIRECCION DE ENTREGA': 'delivery_address',
  'FECHA DE ENTREGA (DIA/MES/AÑO)': 'delivery_date',
  'DETALLE DEL PRODUCTO': 'item_description',
  'MONTO A COBRAR': 'amount_to_collect_at_delivery',
  'FORMA DE PAGO': 'payment_method_for_collection',
  OBSERVACION: 'observations',
};
const EXPECTED_HEADERS = Object.keys(EXCEL_COLUMN_MAP);

// Interfaz para la respuesta simulada de la API de importación
export interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errors?: { row: number; message: string; data?: any }[];
}

@Component({
  selector: 'app-order-import-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatListModule,
    MatTooltipModule,
  ],
  templateUrl: './order-import-modal.component.html',
  styleUrls: ['./order-import-modal.component.scss'],
})
export class OrderImportModalComponent implements OnInit {
  @Output() importCompleted = new EventEmitter<boolean>(); // Para notificar si se debe recargar la lista

  selectedFile: File | null = null;
  fileName: string | null = null;
  isUploading = false;
  uploadProgress = 0; // Para una barra de progreso más detallada (simulada)
  importResult: ImportResult | null = null;

  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);
  public dialogRef = inject(MatDialogRef<OrderImportModalComponent>);
  private settingsService = inject(SettingsService);
  private destroy$ = new Subject<void>();
  enlace: string | null = null;
  constructor() {}

  ngOnInit(): void {
    this.settingsService
      .loadSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (loadedSettings: any) => {
          if (loadedSettings.length) {
            this.enlace = loadedSettings[0].excel_import_template_url;
          }
        },
        error: (err) => {
          console.log('err', err);
        },
      });
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.fileName = this.selectedFile.name;
      this.importResult = null; // Resetear resultados previos
      console.log('File selected:', this.selectedFile);
    } else {
      this.selectedFile = null;
      this.fileName = null;
    }
  }

  downloadTemplate(): string {
    this.snackBar.open('Plantilla con validación descargada.', 'OK', {
      duration: 2000,
    });
    return this.enlace || '';
  }

  async processImport(): Promise<void> {
    if (!this.selectedFile) {
      this.snackBar.open('Por favor, selecciona un archivo Excel.', 'OK', {
        duration: 3000,
        panelClass: ['warn-snackbar'],
      });
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.importResult = null;
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) this.uploadProgress += 10;
    }, 200);

    try {
      let jsonData: any[] = await this.readFileAndParseToJson(
        this.selectedFile
      );
      jsonData = jsonData.filter((item) => item.CARGA === 'CARGAR');
      console.log('Parsed Excel to JSON:', jsonData);
      if (jsonData.length === 0) {
        throw new Error(
          'El archivo Excel no contiene datos (después de las cabeceras) o el formato es incorrecto.'
        );
      }

      this.orderService.importOrdersFromParsedJson(jsonData).subscribe({
        next: (response: ImportResult) => {
          clearInterval(progressInterval);
          this.uploadProgress = 100;
          this.importResult = response;
          if (
            response.success &&
            response.importedCount &&
            response.importedCount > 0
          ) {
            this.snackBar.open(response.message, 'OK', {
              duration: 4000,
              panelClass: ['success-snackbar'],
            });
            this.importCompleted.emit(true);
          } else {
            // Incluso si success es true pero importedCount es 0, o si success es false
            this.snackBar.open(
              response.message ||
                'Algunos pedidos no pudieron ser importados o hubo errores.',
              'OK',
              { duration: 6000, panelClass: ['warn-snackbar'] }
            );
            // No emitimos importCompleted si hubo errores significativos o nada se importó
            if (response.errors && response.errors.length > 0) {
              console.warn('Import errors from backend:', response.errors);
            }
          }
          this.isUploading = false;
        },
        error: (error: any) => {
          clearInterval(progressInterval);
          this.isUploading = false;
          this.uploadProgress = 0;
          this.importResult = {
            success: false,
            message:
              error.message || 'Error en el servidor durante la importación.',
          };
          this.snackBar.open(this.importResult.message, 'OK', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          console.error('Error importing orders:', error);
        },
      });
    } catch (error: any) {
      clearInterval(progressInterval);
      this.isUploading = false;
      this.uploadProgress = 0;
      this.importResult = {
        success: false,
        message: error.message || 'Error al procesar el archivo Excel.',
      };
      this.snackBar.open(this.importResult.message, 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      console.error('Error processing file:', error);
    }
  }

  private readFileAndParseToJson(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No se proporcionó ningún archivo.'));
        return;
      }
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const bstr: string = e.target.result;
          const wb: XLSX.WorkBook = XLSX.read(bstr, {
            type: 'binary',
            cellDates: true,
          }); // cellDates para intentar parsear fechas
          const wsname: string = wb.SheetNames[0];
          if (!wsname) {
            reject(new Error('El archivo Excel no contiene hojas.'));
            return;
          }
          const ws: XLSX.WorkSheet = wb.Sheets[wsname];
          const jsonData: any[] = XLSX.utils.sheet_to_json(ws, {
            raw: false,
            defval: null,
          });
          resolve(
            jsonData.filter((row) =>
              Object.values(row).some((val) => val !== null && val !== '')
            )
          ); // Filtrar filas completamente vacías
        } catch (readError) {
          console.error(
            'Error al leer el contenido de la hoja de Excel:',
            readError
          );
          reject(
            new Error(
              'No se pudo leer el contenido de la hoja de Excel. Formato incorrecto.'
            )
          );
        }
      };
      reader.onerror = (error) => {
        console.error('Error en FileReader:', error);
        reject(new Error('Ocurrió un error al intentar leer el archivo.'));
      };
      reader.readAsBinaryString(file);
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
