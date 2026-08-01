import { Component, Inject, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FulfillmentService } from '../../services/fulfillment.service';
import { UserService } from '../../../../users/services/user.service';
import { User } from '../../../../users/models/user.model';

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
  ],
  template: `
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-left">
          <mat-icon class="header-icon">inventory_2</mat-icon>
          <div>
            <h1 class="header-title">
              {{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}
            </h1>
            <p class="header-subtitle">
              {{
                isEditing
                  ? 'Modifique los datos del producto y sus variaciones'
                  : 'Complete los datos para registrar un nuevo producto'
              }}
            </p>
          </div>
        </div>
        <button mat-icon-button (click)="onCancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="dialog-body">
        <form [formGroup]="productForm" class="product-form">
          <!-- SECCIÓN: Datos del Producto -->
          <div class="form-card">
            <div class="card-header">
              <mat-icon class="card-icon">inventory_2</mat-icon>
              <h2 class="card-title">Datos del Producto</h2>
            </div>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Nombre del Producto</mat-label>
                <input
                  matInput
                  formControlName="name"
                  placeholder="Ej: Polos Algodón"
                  required
                  [matAutocomplete]="autoProductName"
                  (input)="onNameInput($event)"
                />
                <mat-autocomplete
                  #autoProductName="matAutocomplete"
                  (optionSelected)="onNameSelected($event)"
                >
                  @for (name of filteredProductNames; track name) {
                    <mat-option [value]="name">{{ name }}</mat-option>
                  }
                </mat-autocomplete>
                @if (
                  productForm.get('name')?.hasError('required') &&
                  productForm.get('name')?.touched
                ) {
                  <mat-error>El nombre es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Empresa</mat-label>
                <input
                  matInput
                  [matAutocomplete]="autoCompany"
                  [formControl]="companySearchControl"
                  placeholder="Buscar empresa..."
                  required
                />
                <mat-autocomplete
                  #autoCompany="matAutocomplete"
                  (optionSelected)="onCompanySelected($event)"
                >
                  @for (company of filteredCompanyList; track company.id) {
                    <mat-option [value]="company.id">
                      {{ company.username }}
                    </mat-option>
                  }
                </mat-autocomplete>
                @if (
                  productForm.get('company_id')?.hasError('required') &&
                  (productForm.get('company_id')?.touched ||
                    companySearchControl.touched)
                ) {
                  <mat-error>Debe seleccionar una empresa</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-span">
              <mat-label>Descripción</mat-label>
              <textarea
                matInput
                formControlName="description"
                rows="2"
                placeholder="Descripción del producto (opcional)"
              ></textarea>
            </mat-form-field>
          </div>

          <!-- SECCIÓN: Variaciones -->
          <div class="form-card">
            <div class="card-header">
              <mat-icon class="card-icon">difference</mat-icon>
              <h2 class="card-title">Variaciones</h2>
              <button
                type="button"
                mat-raised-button
                class="btn-add-variation"
                (click)="addVariation()"
              >
                <mat-icon>add</mat-icon>
                Agregar Variación
              </button>
            </div>
            <div class="variations-container" formArrayName="variations">
              @for (
                variation of variations.controls.slice();
                track variation;
                let i = $index
              ) {
                <div [formGroupName]="i" class="variation-row">
                  <div class="variation-header">
                    <span class="variation-number">Variación #{{ i + 1 }}</span>
                    <button
                      type="button"
                      mat-icon-button
                      color="warn"
                      class="btn-remove"
                      (click)="removeVariation(i)"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>

                  <div class="form-grid three-columns">
                    <mat-form-field appearance="outline">
                      <mat-label>SKU *</mat-label>
                      <input
                        matInput
                        formControlName="sku"
                        placeholder="Ej: POLO-M-BLANCO"
                      />
                      @if (
                        variation.get('sku')?.hasError('required') &&
                        variation.get('sku')?.touched
                      ) {
                        <mat-error>SKU requerido</mat-error>
                      }
                      @if (isSkuDuplicate(i)) {
                        <mat-error>El SKU ya existe en otra variación</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Color</mat-label>
                      <input
                        matInput
                        formControlName="color"
                        placeholder="Ej: Blanco"
                        [matAutocomplete]="autoColor"
                        (input)="filterVariationValues(i, 'color', $event)"
                      />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Talla</mat-label>
                      <input
                        matInput
                        formControlName="size"
                        placeholder="Ej: M"
                        [matAutocomplete]="autoSize"
                        (input)="filterVariationValues(i, 'size', $event)"
                      />
                    </mat-form-field>
                  </div>

                  <div class="form-grid three-columns">
                    <mat-form-field appearance="outline">
                      <mat-label>Modelo</mat-label>
                      <input
                        matInput
                        formControlName="model"
                        placeholder="Ej: Cuello Redondo"
                        [matAutocomplete]="autoModel"
                        (input)="filterVariationValues(i, 'model', $event)"
                      />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Largo (cm)</mat-label>
                      <input
                        matInput
                        type="number"
                        formControlName="length_cm"
                        placeholder="0"
                        (focus)="selectInputContent($event)"
                      />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Ancho (cm)</mat-label>
                      <input
                        matInput
                        type="number"
                        formControlName="width_cm"
                        placeholder="0"
                        (focus)="selectInputContent($event)"
                      />
                    </mat-form-field>
                  </div>

                  <div class="form-grid three-columns">
                    <mat-form-field appearance="outline">
                      <mat-label>Altura (cm)</mat-label>
                      <input
                        matInput
                        type="number"
                        formControlName="height_cm"
                        placeholder="0"
                        (focus)="selectInputContent($event)"
                      />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Peso (kg)</mat-label>
                      <input
                        matInput
                        type="number"
                        formControlName="weight_kg"
                        placeholder="0"
                        (focus)="selectInputContent($event)"
                      />
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Stock Mínimo</mat-label>
                      <input
                        matInput
                        type="number"
                        formControlName="min_stock"
                        placeholder="5"
                        (focus)="selectInputContent($event)"
                      />
                    </mat-form-field>
                  </div>
                </div>
              }

              <!-- Single autocomplete panels for variation fields (shared across all rows) -->
              <mat-autocomplete #autoColor="matAutocomplete">
                @for (c of filteredColors; track c) {
                  <mat-option [value]="c">{{ c }}</mat-option>
                }
              </mat-autocomplete>
              <mat-autocomplete #autoSize="matAutocomplete">
                @for (s of filteredSizes; track s) {
                  <mat-option [value]="s">{{ s }}</mat-option>
                }
              </mat-autocomplete>
              <mat-autocomplete #autoModel="matAutocomplete">
                @for (m of filteredModels; track m) {
                  <mat-option [value]="m">{{ m }}</mat-option>
                }
              </mat-autocomplete>

              @if (variations.length === 0) {
                <div class="no-variations">
                  <mat-icon>info</mat-icon>
                  <span
                    >No hay variaciones. Haga clic en "Agregar Variación" para
                    añadir una.</span
                  >
                </div>
              }
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="dialog-footer">
        <button
          mat-stroked-button
          (click)="onCancel()"
          class="btn-corp-secondary"
        >
          Cancelar
        </button>
        <button
          mat-raised-button
          class="btn-corp-primary"
          [disabled]="productForm.invalid || isSaving"
          (click)="onSave()"
        >
          @if (isSaving) {
            <mat-spinner diameter="20" class="spinner-inline"></mat-spinner>
          } @else {
            <mat-icon class="btn-icon">save</mat-icon>
            {{ isEditing ? 'Guardar Cambios' : 'Crear Producto' }}
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
        height: 100vh;
        background: #f5f7fa;
      }

      /* ===== HEADER ===== */
      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 32px;
        background: #fff;
        border-bottom: 1px solid #e2e8f0;
        flex-shrink: 0;
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .header-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #f97c06;
      }
      .header-title {
        font-size: 22px;
        font-weight: 700;
        color: #012147;
        margin: 0;
        line-height: 1.2;
      }
      .header-subtitle {
        font-size: 13px;
        color: #64748b;
        margin: 2px 0 0 0;
      }
      .close-btn {
        color: #94a3b8;
      }
      .close-btn:hover {
        color: #475569;
      }

      /* ===== BODY ===== */
      .dialog-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px 32px;
      }
      .product-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 1400px;
        margin: 0 auto;
      }

      /* ===== FORM CARDS ===== */
      .form-card {
        background: #fff;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        border: 1px solid #e2e8f0;
      }
      .card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 2px solid #f97c06;
      }
      .card-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
        color: #f97c06;
      }
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #012147;
        margin: 0;
      }

      /* ===== FORM GRID ===== */
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      .form-grid.three-columns {
        grid-template-columns: 1fr 1fr 1fr;
      }
      .form-grid.variation-dim-row {
        grid-template-columns: 1fr 1fr 1fr 1fr;
      }
      .form-grid.six-columns {
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
      }
      .full-span {
        grid-column: 1 / -1;
        margin-top: 16px;
      }

      /* ===== VARIATIONS ===== */
      .variations-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .variation-row {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        background: #f8fafc;
      }
      .variation-row .form-grid {
        margin-bottom: 16px;
      }
      .variation-row .form-grid:last-child {
        margin-bottom: 0;
      }
      .variation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .variation-number {
        font-weight: 600;
        font-size: 13px;
        color: #012147;
      }
      .btn-remove {
        width: 28px;
        height: 28px;
        line-height: 28px;
      }
      .btn-remove mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        line-height: 18px;
      }
      .no-variations {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 24px;
        color: #94a3b8;
        font-size: 13px;
        justify-content: center;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
      }
      .btn-add-variation {
        background-color: #012147 !important;
        color: #fff !important;
        font-size: 12px;
        padding: 2px 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      }
      .btn-add-variation mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      /* ===== FOOTER ===== */
      .dialog-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 32px;
        background: #fff;
        border-top: 1px solid #e2e8f0;
        flex-shrink: 0;
      }
      .btn-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 4px;
      }
      .btn-corp-primary {
        background-color: #f97c06 !important;
        color: #fff !important;
      }

      /* ===== MATERIAL OVERRIDES ===== */
      :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }
      :host ::ng-deep .mat-mdc-form-field {
        margin-bottom: 0;
      }
      .spinner-inline {
        display: inline-block;
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 768px) {
        .dialog-header {
          padding: 12px 16px;
        }
        .header-left {
          gap: 10px;
        }
        .header-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
        .header-title {
          font-size: 16px;
        }
        .header-subtitle {
          font-size: 11px;
        }
        .dialog-body {
          padding: 12px 16px;
        }
        .product-form {
          gap: 12px;
        }
        .form-card {
          padding: 14px;
        }
        .form-card + .form-card {
          margin-top: 0;
        }
        .form-grid {
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .form-grid.three-columns {
          grid-template-columns: 1fr;
        }
        .form-grid.variation-dim-row {
          grid-template-columns: 1fr;
        }
        .form-grid.six-columns {
          grid-template-columns: 1fr;
        }
        .full-span {
          margin-top: 10px;
        }
        .card-header {
          flex-wrap: wrap;
          gap: 8px;
        }
        .card-title {
          font-size: 14px;
        }
        .btn-add-variation {
          width: 100%;
          justify-content: center;
          margin-left: 0;
        }
        .variations-container {
          gap: 10px;
        }
        .variation-row {
          padding: 10px;
        }
        .variation-number {
          font-size: 12px;
        }
        .no-variations {
          padding: 16px;
          font-size: 12px;
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
export class ProductFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private fulfillmentService = inject(FulfillmentService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  @Inject(MAT_DIALOG_DATA) private dialogData: any = inject(MAT_DIALOG_DATA);

  productForm!: FormGroup;
  isEditing = false;
  editingProductId: string | null = null;
  isSaving = false;
  allCompanies: User[] = [];
  filteredCompanyList: User[] = [];
  companySearchControl = this.fb.control('');
  allProductNames: string[] = [];
  filteredProductNames: string[] = [];
  allColors: string[] = [];
  allSizes: string[] = [];
  allModels: string[] = [];
  filteredColors: string[] = [];
  filteredSizes: string[] = [];
  filteredModels: string[] = [];

  ngOnInit(): void {
    this.isEditing = !!this.dialogData?.product;
    this.editingProductId = this.dialogData?.product?.id || null;
    this.initForm();
    this.loadCompanies();
    this.loadProductNames();
    this.loadVariationValues();
  }

  private loadProductNames(): void {
    this.fulfillmentService.getProductNames().subscribe({
      next: (names) => {
        this.allProductNames = names;
        this.filteredProductNames = names;
      },
      error: () => {
        // Silently fail - autocomplete just won't show suggestions
      },
    });
  }

  private loadVariationValues(): void {
    this.fulfillmentService.getVariationValues().subscribe({
      next: (values) => {
        this.allColors = values.colors;
        this.allSizes = values.sizes;
        this.allModels = values.models;
        this.filteredColors = values.colors;
        this.filteredSizes = values.sizes;
        this.filteredModels = values.models;
      },
      error: () => {
        // Silently fail - autocomplete just won't show suggestions
      },
    });
  }

  onNameInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value?.toLowerCase() || '';
    this.filteredProductNames = this.allProductNames.filter((name) =>
      name.toLowerCase().includes(input),
    );
  }

  onNameSelected(event: any): void {
    this.productForm.get('name')?.markAsTouched();
  }

  filterVariationValues(
    variationIndex: number,
    field: 'color' | 'size' | 'model',
    event: Event,
  ): void {
    const input = (event.target as HTMLInputElement).value?.toLowerCase() || '';
    if (field === 'color') {
      this.filteredColors = this.allColors.filter((c) =>
        c.toLowerCase().includes(input),
      );
    } else if (field === 'size') {
      this.filteredSizes = this.allSizes.filter((s) =>
        s.toLowerCase().includes(input),
      );
    } else if (field === 'model') {
      this.filteredModels = this.allModels.filter((m) =>
        m.toLowerCase().includes(input),
      );
    }
  }

  selectInputContent(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  private initForm(): void {
    const product = this.dialogData?.product;

    this.productForm = this.fb.group({
      name: [product?.name || '', Validators.required],
      description: [product?.description || ''],
      company_id: [product?.company_id || '', Validators.required],
      variations: this.fb.array([]),
    });

    // If editing, populate variations
    if (product?.variations?.length) {
      product.variations.forEach((v: any) => {
        this.variations.push(
          this.fb.group({
            id: [v.id],
            sku: [v.sku, Validators.required],
            color: [v.color || ''],
            size: [v.size || ''],
            model: [v.model || ''],
            length_cm: [v.length_cm || 0],
            width_cm: [v.width_cm || 0],
            height_cm: [v.height_cm || 0],
            weight_kg: [v.weight_kg || 0],
            min_stock: [v.min_stock || 5],
          }),
        );
      });
    }
  }

  get variations(): FormArray {
    return this.productForm.get('variations') as FormArray;
  }

  private createVariationForm(): FormGroup {
    return this.fb.group({
      sku: [this.generateSku(), Validators.required],
      color: [''],
      size: [''],
      model: [''],
      length_cm: [0],
      width_cm: [0],
      height_cm: [0],
      weight_kg: [0],
      min_stock: [5],
    });
  }

  private generateSku(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  addVariation(): void {
    this.variations.push(this.createVariationForm());
    this.cdr.detectChanges();
  }

  isSkuDuplicate(index: number): boolean {
    const sku = this.variations.at(index)?.get('sku')?.value;
    if (!sku) return false;
    const count = this.variations.controls.filter(
      c => c.get('sku')?.value === sku,
    ).length;
    return count > 1;
  }

  removeVariation(index: number): void {
    this.variations.removeAt(index);
  }

  private loadCompanies(): void {
    // Load users with role EMPRESA or EMPRESA_DISTRIBUIDOR that have isFulfillmentEnabled=true
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.allCompanies = users.filter(
          (u) =>
            (u.role === 'EMPRESA' || u.role === 'EMPRESA_DISTRIBUIDOR') &&
            u.isFulfillmentEnabled === true,
        );
        this.filteredCompanyList = this.allCompanies;

        // If editing, set the company search control to the selected company name
        const product = this.dialogData?.product;
        if (product?.company_id) {
          const company = this.allCompanies.find(
            (c) => c.id === product.company_id,
          );
          if (company) {
            this.companySearchControl.setValue(company.username, {
              emitEvent: false,
            });
          }
        }

        // Filter companies as user types in the search input
        this.companySearchControl.valueChanges.subscribe((searchTerm) => {
          const term = (searchTerm || '').toLowerCase();
          this.filteredCompanyList = this.allCompanies.filter((c) =>
            c.username.toLowerCase().includes(term),
          );
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar empresas', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  onCompanySelected(event: any): void {
    const selectedId = event.option.value;
    this.productForm.get('company_id')?.setValue(selectedId);
    // Update the search input to show the selected company's name
    const company = this.allCompanies.find((c) => c.id === selectedId);
    if (company) {
      this.companySearchControl.setValue(company.username, {
        emitEvent: false,
      });
    }
  }

  onSave(): void {
    if (this.productForm.invalid) return;

    this.isSaving = true;
    const formValue = this.productForm.value;

    if (this.isEditing && this.editingProductId) {
      this.fulfillmentService
        .updateProduct(this.editingProductId, formValue)
        .subscribe({
          next: () => {
            this.snackBar.open('Producto actualizado exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.isSaving = false;
            const message =
              err.error?.message || 'Error al actualizar el producto';
            this.snackBar.open(message, 'Cerrar', {
              duration: 5000,
            });
          },
        });
    } else {
      this.fulfillmentService.createProduct(formValue).subscribe({
        next: () => {
          this.snackBar.open('Producto creado exitosamente', 'Cerrar', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isSaving = false;
          const message = err.error?.message || 'Error al guardar el producto';
          this.snackBar.open(message, 'Cerrar', {
            duration: 5000,
          });
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
