import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { take } from 'rxjs';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  ROLES_LIST,
} from '../../models/user.model';
import { SettingsService } from '../../../settings/services/settings.service';
import { VolumeDiscountRule } from '../../../settings/models/app-settings.interface';

export interface UserDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-left">
          <mat-icon class="header-icon">person</mat-icon>
          <div>
            <h1 class="header-title">
              {{ data.mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario' }}
            </h1>
            <p class="header-subtitle">
              {{
                data.mode === 'create'
                  ? 'Complete los datos para crear un nuevo usuario'
                  : 'Modifique los datos del usuario'
              }}
            </p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Body -->
      <div class="dialog-body">
        <form [formGroup]="userForm" class="user-form">
          <!-- SECCIÓN: Datos Básicos -->
          <div class="form-card">
            <div class="card-header">
              <mat-icon class="card-icon">badge</mat-icon>
              <h2 class="card-title">Datos Básicos</h2>
            </div>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Usuario</mat-label>
                <input matInput formControlName="username" placeholder="Ingrese el nombre de usuario" />
                @if (userForm.get('username')?.hasError('required') && userForm.get('username')?.touched) {
                <mat-error>El usuario es obligatorio</mat-error>
                }
                @if (userForm.get('username')?.hasError('minlength')) {
                <mat-error>Mínimo 4 caracteres</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" placeholder="correo@ejemplo.com" />
                @if (userForm.get('email')?.hasError('required') && userForm.get('email')?.touched) {
                <mat-error>El email es obligatorio</mat-error>
                }
                @if (userForm.get('email')?.hasError('email')) {
                <mat-error>Ingrese un email válido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Contraseña</mat-label>
                <input
                  matInput
                  formControlName="password"
                  [type]="hidePassword ? 'password' : 'text'"
                  placeholder="••••••••"
                />
                <button
                  mat-icon-button
                  matSuffix
                  (click)="hidePassword = !hidePassword"
                  type="button"
                >
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (userForm.get('password')?.hasError('required') && userForm.get('password')?.touched) {
                <mat-error>La contraseña es obligatoria</mat-error>
                }
                @if (userForm.get('password')?.hasError('minlength')) {
                <mat-error>Mínimo 4 caracteres</mat-error>
                }
                @if (data.mode === 'edit') {
                <mat-hint>Dejar en blanco para mantener la contraseña actual</mat-hint>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Rol</mat-label>
                <mat-select formControlName="role">
                  @for (role of roles; track role.value) {
                  <mat-option [value]="role.value">{{ role.label }}</mat-option>
                  }
                </mat-select>
                @if (userForm.get('role')?.hasError('required') && userForm.get('role')?.touched) {
                <mat-error>El rol es obligatorio</mat-error>
                }
              </mat-form-field>

              @if (showDriverSection) {
              <mat-form-field appearance="outline">
                <mat-label>Código del Motorista</mat-label>
                <input matInput formControlName="driverCode" placeholder="Ingrese el código" />
              </mat-form-field>
              }
            </div>
          </div>

          <!-- SECCIÓN: Datos del Negocio -->
          @if (showBusinessSection) {
          <div class="form-card">
            <div class="card-header">
              <mat-icon class="card-icon">store</mat-icon>
              <h2 class="card-title">Datos del Negocio</h2>
            </div>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Tipo de Negocio</mat-label>
                <input matInput formControlName="business_type" placeholder="Ej: Distribuidor, Tienda" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nombre del Negocio</mat-label>
                <input matInput formControlName="business_name" placeholder="Razón social" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Distrito</mat-label>
                <input matInput formControlName="business_district" placeholder="Distrito" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Dirección</mat-label>
                <input matInput formControlName="business_address" placeholder="Dirección completa" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="business_phone_number" placeholder="Teléfono de contacto" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Sector</mat-label>
                <input matInput formControlName="business_sector" placeholder="Sector comercial" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Tipo de Documento</mat-label>
                <input matInput formControlName="business_document_type" placeholder="DNI, RUC, etc." />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Número de Documento</mat-label>
                <input matInput formControlName="business_document_number" placeholder="Número de documento" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email del Negocio</mat-label>
                <input matInput formControlName="business_email" type="email" placeholder="correo@negocio.com" />
              </mat-form-field>

              <div class="checkbox-wrapper">
                <mat-checkbox formControlName="assumes_5_percent_pos">
                  Asume 5% POS
                </mat-checkbox>
              </div>

              <!-- Servicio Fulfillment -->
              <div class="fulfillment-toggle-wrapper">
                <div class="fulfillment-toggle-content">
                  <div class="fulfillment-toggle-left">
                    <mat-icon class="card-icon">inventory_2</mat-icon>
                    <div>
                      <span class="fulfillment-toggle-label">Servicio Fulfillment</span>
                      <span class="fulfillment-toggle-hint">Almacenamiento y despacho de productos</span>
                    </div>
                  </div>
                  <mat-slide-toggle
                    formControlName="isFulfillmentEnabled"
                    color="primary"
                  ></mat-slide-toggle>
                </div>
              </div>

              <!-- Tarifa Especial por Volumen -->
              <div class="volume-discount-section">
                <div class="volume-header">
                  <div class="volume-header-left">
                    <mat-icon class="card-icon">auto_graph</mat-icon>
                    <span class="volume-title">Tarifa Especial por Volumen</span>
                  </div>
                  <mat-slide-toggle
                    formControlName="isVolumeDiscountEnabled"
                    color="primary"
                  ></mat-slide-toggle>
                </div>

                @if (userForm.get('isVolumeDiscountEnabled')?.value) {
                <mat-form-field appearance="outline" class="full-span">
                  <mat-label>Seleccionar Planes de Descuento</mat-label>
                  <mat-select
                    formControlName="assignedVolumeDiscountRuleIds"
                    multiple
                  >
                    @if (allRules.length === 0) {
                    <mat-option disabled>No hay reglas creadas en configuración</mat-option>
                    }
                    <!-- Grupo: RANGOS -->
                    <mat-optgroup label="PROGRESIVOS (Por Rango)">
                      @for (rule of getRulesByType('RANGE'); track rule.id) {
                      <mat-option [value]="rule.id">
                        Rango {{ rule.minOrders }} - {{ rule.maxOrders || '∞' }} envíos
                        (Desc: {{ rule.discountPercentage }}%)
                      </mat-option>
                      }
                    </mat-optgroup>
                    <!-- Grupo: METAS -->
                    <mat-optgroup label="RETROACTIVOS (Por Meta)">
                      @for (rule of getRulesByType('GOAL'); track rule.id) {
                      <mat-option [value]="rule.id">
                        Meta de {{ rule.minOrders }} envíos
                        (Desc: {{ rule.discountPercentage }}%)
                      </mat-option>
                      }
                    </mat-optgroup>
                  </mat-select>
                </mat-form-field>
                }
              </div>
            </div>
          </div>
          }

          <!-- SECCIÓN: Datos del Propietario -->
          @if (showOwnerSection) {
          <div class="form-card">
            <div class="card-header">
              <mat-icon class="card-icon">person_outline</mat-icon>
              <h2 class="card-title">Datos del Propietario</h2>
            </div>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Nombre del Propietario</mat-label>
                <input matInput formControlName="owner_name" placeholder="Nombre completo" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Teléfono del Propietario</mat-label>
                <input matInput formControlName="owner_phone_number" placeholder="Teléfono de contacto" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Tipo de Documento</mat-label>
                <input matInput formControlName="owner_document_type" placeholder="DNI, RUC, etc." />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Número de Documento</mat-label>
                <input matInput formControlName="owner_document_number" placeholder="Número de documento" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email del Propietario</mat-label>
                <input matInput formControlName="owner_email_address" type="email" placeholder="correo@propietario.com" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Cuenta Bancaria</mat-label>
                <input matInput formControlName="owner_bank_account" placeholder="Número de cuenta" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-span">
                <mat-label>Nombre del Titular de la Cuenta</mat-label>
                <input matInput formControlName="name_account_number_owner" placeholder="Nombre del titular" />
              </mat-form-field>
            </div>
          </div>
          }
        </form>
      </div>

      <!-- Footer -->
      <div class="dialog-footer">
        <button mat-stroked-button mat-dialog-close class="btn-corp-secondary">
          Cancelar
        </button>
        <button
          mat-raised-button
          class="btn-corp-primary"
          [disabled]="userForm.invalid || isLoading"
          (click)="onSave()"
        >
          @if (isLoading) {
          <mat-spinner diameter="20" class="spinner-inline"></mat-spinner>
          } @else {
          <mat-icon class="btn-icon">save</mat-icon>
          {{ data.mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios' }}
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
      .user-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 960px;
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
        gap: 16px;
      }
      .field-group.full-span {
        grid-column: 1 / -1;
      }
      .field-label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        color: #012147;
        margin-bottom: 4px;
        padding-left: 2px;
      }
      .checkbox-wrapper {
        display: flex;
        align-items: center;
        padding-top: 8px;
      }

      /* ===== FULFILLMENT TOGGLE ===== */
      .fulfillment-toggle-wrapper {
        grid-column: 1 / -1;
        margin-top: 4px;
      }
      .fulfillment-toggle-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: #f0f9ff;
        border-radius: 8px;
        border: 1px solid #bae6fd;
      }
      .fulfillment-toggle-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .fulfillment-toggle-label {
        font-size: 14px;
        font-weight: 600;
        color: #012147;
        display: block;
      }
      .fulfillment-toggle-hint {
        font-size: 12px;
        color: #64748b;
        display: block;
        margin-top: 1px;
      }

      /* ===== VOLUME DISCOUNT ===== */
      .volume-discount-section {
        grid-column: 1 / -1;
        margin-top: 8px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .volume-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .volume-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .volume-title {
        font-size: 14px;
        font-weight: 600;
        color: #012147;
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
      .spinner-inline {
        display: inline-block;
      }

      /* ===== MATERIAL OVERRIDES ===== */
      :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }
      :host ::ng-deep .mat-mdc-form-field {
        margin-bottom: 0;
      }
      /* Compact input fields - smaller height, keep label size */
      :host ::ng-deep .mat-mdc-text-field-wrapper {
        height: 48px !important;
      }
      :host ::ng-deep .mat-mdc-form-field-infix {
        padding-top: 14px !important;
        padding-bottom: 4px !important;
        min-height: 48px !important;
      }
      :host ::ng-deep .mat-mdc-text-field-wrapper.mdc-text-field--outline .mat-mdc-form-field-infix {
        padding-top: 14px !important;
        padding-bottom: 4px !important;
      }
    `,
  ],
})
export class UserFormDialogComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  roles = ROLES_LIST;
  allRules: VolumeDiscountRule[] = [];

  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData,
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        data.mode === 'create'
          ? [Validators.required, Validators.minLength(4)]
          : [],
      ],
      role: ['', [Validators.required]],
      driverCode: [''],
      business_type: [''],
      business_name: [''],
      business_district: [''],
      business_address: [''],
      business_phone_number: [''],
      business_sector: [''],
      business_document_type: [''],
      business_email: [''],
      business_document_number: [''],
      assumes_5_percent_pos: [false],
      owner_name: [''],
      owner_phone_number: [''],
      owner_document_type: [''],
      owner_document_number: [''],
      owner_email_address: [''],
      owner_bank_account: [''],
      name_account_number_owner: [''],
      isVolumeDiscountEnabled: [false],
      assignedVolumeDiscountRuleIds: [[]],
      isFulfillmentEnabled: [false],
    });
  }

  getRulesByType(type: 'RANGE' | 'GOAL'): VolumeDiscountRule[] {
    return this.allRules.filter((r) => r.type === type && r.isActive);
  }

  ngOnInit(): void {
    this.loadAllAvailableRules();

    if (this.data.mode === 'edit' && this.data.user) {
      const user = this.data.user;
      this.userForm.patchValue({
        username: user.username,
        email: user.email,
        role: user.role,
        driverCode: user.driverCode || '',
        business_type: user.business_type || '',
        business_name: user.business_name || '',
        business_district: user.business_district || '',
        business_address: user.business_address || '',
        business_phone_number: user.business_phone_number || '',
        business_sector: user.business_sector || '',
        business_document_type: user.business_document_type || '',
        business_email: user.business_email || '',
        business_document_number: user.business_document_number || '',
        assumes_5_percent_pos: user.assumes_5_percent_pos || false,
        owner_name: user.owner_name || '',
        owner_phone_number: user.owner_phone_number || '',
        owner_document_type: user.owner_document_type || '',
        owner_document_number: user.owner_document_number || '',
        owner_email_address: user.owner_email_address || '',
        owner_bank_account: user.owner_bank_account || '',
        name_account_number_owner: user.name_account_number_owner || '',
        isVolumeDiscountEnabled: user.isVolumeDiscountEnabled || false,
        assignedVolumeDiscountRuleIds: user.assignedVolumeDiscountRuleIds || [],
        isFulfillmentEnabled: user.isFulfillmentEnabled || false,
      });

      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }

    this.userForm.get('role')?.valueChanges.subscribe(() => {
      this.userForm.get('password')?.updateValueAndValidity();
    });
  }

  private loadAllAvailableRules(): void {
    this.settingsService
      .loadSettings()
      .pipe(take(1))
      .subscribe((settings: any) => {
        const currentSettings = Array.isArray(settings)
          ? settings[0]
          : settings;
        if (currentSettings && currentSettings.volumeDiscountRules) {
          this.allRules = currentSettings.volumeDiscountRules;
        }
      });
  }

  get showDriverSection(): boolean {
    return this.userForm.get('role')?.value === 'MOTORIZADO';
  }

  get showBusinessSection(): boolean {
    const role = this.userForm.get('role')?.value;
    return role === 'EMPRESA' || role === 'EMPRESA_DISTRIBUIDOR';
  }

  get showOwnerSection(): boolean {
    const role = this.userForm.get('role')?.value;
    return role === 'EMPRESA' || role === 'EMPRESA_DISTRIBUIDOR';
  }

  onSave(): void {
    if (this.userForm.valid && !this.isLoading) {
      this.isLoading = true;

      const formValue = { ...this.userForm.value };

      if (this.data.mode === 'edit') {
        if (!formValue.password) {
          delete formValue.password;
        }
        delete formValue.code;
      }

      this.dialogRef.close({ data: formValue, mode: this.data.mode });
    }
  }
}
