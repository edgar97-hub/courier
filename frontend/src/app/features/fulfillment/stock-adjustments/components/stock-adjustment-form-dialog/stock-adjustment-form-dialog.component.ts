import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StockAdjustmentService } from '../../services/stock-adjustment.service';
import { CreateStockAdjustmentDto } from '../../models/stock-adjustment.model';
import { FulfillmentProduct } from '../../../products/models/fulfillment-product.model';
import { UserService } from '../../../../users/services/user.service';
import { User } from '../../../../users/models/user.model';

@Component({
  selector: 'app-stock-adjustment-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>Registrar Movimiento de Stock</h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-body">
        <form [formGroup]="form" class="adjustment-form">
          <!-- Cliente (Empresa) - Autocomplete -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Usuario (Empresa)</mat-label>
              <input
                matInput
                type="text"
                [formControl]="companySearchControl"
                [matAutocomplete]="companyAuto"
                placeholder="Buscar empresa..."
                required
              />
              <mat-autocomplete
                #companyAuto="matAutocomplete"
                (optionSelected)="onCompanySelected($event)"
              >
                @for (company of filteredCompanies; track company.id) {
                  <mat-option [value]="company.id">
                    {{ company.username }}
                  </mat-option>
                }
              </mat-autocomplete>
              @if (
                form.get('company_id')?.hasError('required') &&
                (form.get('company_id')?.touched ||
                  companySearchControl.touched)
              ) {
                <mat-error>Campo requerido</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Producto - Autocomplete -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Producto</mat-label>
              <input
                matInput
                type="text"
                [formControl]="productSearchControl"
                [matAutocomplete]="productAuto"
                placeholder="Buscar producto..."
                required
              />
              <mat-autocomplete
                #productAuto="matAutocomplete"
                (optionSelected)="onProductSelected($event)"
              >
                @for (product of filteredProducts; track product.id) {
                  <mat-option [value]="product.id">{{
                    product.name
                  }}</mat-option>
                }
              </mat-autocomplete>
              @if (
                form.get('product_id')?.hasError('required') &&
                (form.get('product_id')?.touched || productSearchControl.touched)
              ) {
                <mat-error>Campo requerido</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Variación / SKU -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Variación / SKU</mat-label>
              <mat-select formControlName="variation_id">
                @for (variation of filteredVariations; track variation.id) {
                  <mat-option [value]="variation.id">
                    {{ getVariationLabel(variation) }}
                  </mat-option>
                }
              </mat-select>
              @if (
                form.get('variation_id')?.hasError('required') &&
                form.get('variation_id')?.touched
              ) {
                <mat-error>Campo requerido</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Tipo de Operación -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Tipo de Operación</mat-label>
              <mat-select formControlName="adjustment_type">
                <!-- <mat-option [value]="'INBOUND'"
                  >Ingreso por Abastecimiento</mat-option
                > -->
                <mat-option [value]="'MANUAL_ADD'"
                  >Ajuste Manual - Suma</mat-option
                >
                <mat-option [value]="'MANUAL_SUBTRACT'"
                  >Ajuste Manual - Resta</mat-option
                >
              </mat-select>
              @if (
                form.get('adjustment_type')?.hasError('required') &&
                form.get('adjustment_type')?.touched
              ) {
                <mat-error>Campo requerido</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Cantidad -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Cantidad</mat-label>
              <input
                matInput
                type="number"
                formControlName="quantity"
                min="1"
                step="1"
              />
              @if (
                form.get('quantity')?.hasError('required') &&
                form.get('quantity')?.touched
              ) {
                <mat-error>Campo requerido</mat-error>
              }
              @if (form.get('quantity')?.hasError('min')) {
                <mat-error>Debe ser mayor a 0</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Observación -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Observación / Motivo</mat-label>
              <textarea
                matInput
                formControlName="observation"
                rows="3"
              ></textarea>
              @if (
                form.get('observation')?.hasError('required') &&
                form.get('observation')?.touched
              ) {
                <mat-error>Campo requerido</mat-error>
              }
            </mat-form-field>
          </div>
        </form>
      </div>

      <div class="dialog-footer">
        <button
          mat-stroked-button
          class="btn-corp-secondary"
          (click)="onCancel()"
        >
          Cancelar
        </button>
        <button
          mat-raised-button
          class="btn-corp-primary"
          (click)="onSave()"
          [disabled]="form.invalid || saving"
        >
          @if (saving) {
            Guardando...
          } @else {
            Guardar Movimiento
          }
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        display: flex;
        flex-direction: column;
        max-height: 90vh;
        border-radius: 12px;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
      }
      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #e0e0e0;
        background: #fafafa;
        flex-shrink: 0;
      }
      .dialog-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #012147;
      }
      .dialog-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
      }
      .adjustment-form {
        max-width: 600px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .form-row {
        width: 100%;
      }
      .form-field {
        width: 100%;
      }
      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
        background: #fafafa;
        flex-shrink: 0;
      }
      .btn-corp-primary {
        background-color: #f97c06 !important;
        color: #fff !important;
      }
      .btn-corp-secondary {
        border-color: #f97c06 !important;
        color: #f97c06 !important;
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 600px) {
        .dialog-header {
          padding: 12px 16px;
        }
        .dialog-header h2 {
          font-size: 16px;
        }
        .dialog-body {
          padding: 16px;
        }
        .adjustment-form {
          gap: 12px;
        }
        .dialog-footer {
          padding: 12px 16px;
          flex-direction: column-reverse;
          gap: 8px;
        }
        .dialog-footer button {
          width: 100%;
        }
      }
    `,
  ],
})
export class StockAdjustmentFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<StockAdjustmentFormDialogComponent>);
  private adjustmentService = inject(StockAdjustmentService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  saving = false;

  // Companies
  companySearchControl = this.fb.control('');
  companies: User[] = [];
  filteredCompanies: User[] = [];

  // Products
  productSearchControl = this.fb.control('');
  allProducts: FulfillmentProduct[] = [];
  filteredProducts: FulfillmentProduct[] = [];

  // Variations
  filteredVariations: any[] = [];

  mainWarehouseId = '';

  ngOnInit(): void {
    this.initForm();
    this.loadCompanies();
    this.loadMainWarehouse();
  }

  private initForm(): void {
    this.form = this.fb.group({
      company_id: ['', Validators.required],
      product_id: ['', Validators.required],
      variation_id: ['', Validators.required],
      adjustment_type: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      observation: ['', Validators.required],
    });
  }

  private loadCompanies(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.companies = users.filter(
          (u) =>
            (u.role === 'EMPRESA' || u.role === 'EMPRESA_DISTRIBUIDOR') &&
            u.isFulfillmentEnabled === true,
        );
        this.filteredCompanies = this.companies;

        // Filter companies as user types in the search input
        this.companySearchControl.valueChanges.subscribe((searchTerm) => {
          const term = (searchTerm || '').toLowerCase();
          this.filteredCompanies = this.companies.filter((c) =>
            c.username.toLowerCase().includes(term),
          );
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar empresas', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  private loadMainWarehouse(): void {
    this.adjustmentService.getMainWarehouse().subscribe({
      next: (warehouse) => {
        this.mainWarehouseId = warehouse.id;
      },
      error: () => {
        this.snackBar.open('Error al cargar almacén principal', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  /** When a company is selected from autocomplete */
  onCompanySelected(event: any): void {
    const selectedId = event.option.value;
    this.form.patchValue({
      company_id: selectedId,
      product_id: '',
      variation_id: '',
    });
    // Update the search input to show the selected company's name
    const company = this.companies.find((c) => c.id === selectedId);
    if (company) {
      this.companySearchControl.setValue(company.username, {
        emitEvent: false,
      });
    }
    // Reset product search
    this.productSearchControl.setValue('', { emitEvent: false });
    this.filteredVariations = [];
    this.allProducts = [];
    this.filteredProducts = [];

    this.adjustmentService.getProductsByCompany(selectedId).subscribe({
      next: (products) => {
        this.allProducts = products;
        this.filteredProducts = products;
      },
      error: () => {
        this.snackBar.open('Error al cargar productos', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  /** Filter products list based on typed text */
  filterProducts(): void {
    const value =
      this.productSearchControl.value?.toString().toLowerCase() || '';
    if (!value) {
      this.filteredProducts = this.allProducts;
      return;
    }
    this.filteredProducts = this.allProducts.filter((p) =>
      p.name?.toLowerCase().includes(value),
    );
  }

  /** When a product is selected from autocomplete */
  onProductSelected(event: any): void {
    const selectedId = event.option.value;
    // Reset variation
    this.form.patchValue({ variation_id: '' });

    if (!selectedId) return;

    this.form.patchValue({ product_id: selectedId });
    // Update the search input to show the selected product's name
    const product = this.allProducts.find((p) => p.id === selectedId);
    if (product) {
      this.productSearchControl.setValue(product.name, {
        emitEvent: false,
      });
    }

    this.adjustmentService.getVariationsByProduct(selectedId).subscribe({
      next: (variations) => {
        this.filteredVariations = variations;
      },
      error: () => {
        this.snackBar.open('Error al cargar variaciones', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  getVariationLabel(variation: any): string {
    const parts: string[] = [`[${variation.sku}]`];
    if (variation.color) parts.push(`Color: ${variation.color}`);
    if (variation.size) parts.push(`Talla: ${variation.size}`);
    if (variation.model) parts.push(`Modelo: ${variation.model}`);
    return parts.join(' - ');
  }

  onSave(): void {
    if (this.form.invalid) return;

    this.saving = true;
    const dto: CreateStockAdjustmentDto = {
      adjustment_type: this.form.value.adjustment_type,
      quantity: this.form.value.quantity,
      observation: this.form.value.observation,
      company_id: this.form.value.company_id,
      product_id: this.form.value.product_id,
      variation_id: this.form.value.variation_id,
      warehouse_id: this.mainWarehouseId,
    };

    this.adjustmentService.createAdjustment(dto).subscribe({
      next: () => {
        this.snackBar.open('Movimiento registrado correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(
          err.error?.message || 'Error al registrar movimiento',
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
          },
        );
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
