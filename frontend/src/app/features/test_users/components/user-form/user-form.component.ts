import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { User } from '../../models/user.model';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserRole } from '../../../../common/roles.enum';
import { VolumeDiscountRule } from '../../../settings/models/app-settings.interface';
import { SettingsService } from '../../../settings/services/settings.service';
import { take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSlideToggleModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  @Input() userToEdit: User | null = null;
  @Input() isLoading: boolean = false;
  @Output() formSubmit = new EventEmitter<User>();
  @Output() formCancel = new EventEmitter<void>();

  userForm!: FormGroup;
  hidePassword = signal(true);
  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAllAvailableRules();

    if (this.userToEdit) {
      this.userForm.patchValue(this.userToEdit);
    }

    this.userForm.get('role')?.valueChanges.subscribe((roleValue) => {
      this.handleRoleChange(roleValue);
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

  getRulesByType(type: 'RANGE' | 'GOAL') {
    return this.allRules.filter((r) => r.type === type && r.isActive);
  }

  private hasRuleConflict(): boolean {
    const selectedIds =
      this.userForm.get('assignedVolumeDiscountRuleIds')?.value || [];
    if (selectedIds.length === 0) return false;

    const selectedRules = this.allRules.filter((r) =>
      selectedIds.includes(r.id),
    );

    for (let i = 0; i < selectedRules.length; i++) {
      for (let j = i + 1; j < selectedRules.length; j++) {
        const ruleA = selectedRules[i];
        const ruleB = selectedRules[j];

        // 1. Validar solapamiento de FECHAS
        const s1 = ruleA.startDate!;
        const e1 = ruleA.endDate || '9999-12-31';
        const s2 = ruleB.startDate!;
        const e2 = ruleB.endDate || '9999-12-31';

        const dateOverlap = s1 <= e2 && s2 <= e1;
        // Si las fechas se cruzan, entramos a validar los tipos
        if (dateOverlap) {
          // ============================================================
          // REGLA MAESTRA: NO MEZCLAR TIPOS EN LA MISMA FECHA
          // ============================================================
          // Si el tipo es diferente (uno es RANGE y el otro es GOAL)
          // y las fechas se tocan, BLOQUEAMOS DE INMEDIATO.
          if (ruleA.type !== ruleB.type) {
            this.showConflictError(
              ruleA,
              ruleB,
              'No puedes mezclar reglas de "Rango" y "Meta" en las mismas fechas.',
            );
            return true;
          }

          // --- Si llegamos aquí, es porque son del MISMO TIPO y las fechas chocan ---
          // Ahora validamos si el VOLUMEN también se cruza para ese mismo tipo

          const minA = Number(ruleA.minOrders);
          const maxA =
            ruleA.type === 'RANGE' ? Number(ruleA.maxOrders || 999999) : minA;

          const minB = Number(ruleB.minOrders);
          const maxB =
            ruleB.type === 'RANGE' ? Number(ruleB.maxOrders || 999999) : minB;

          const volumeOverlap = minA <= maxB && minB <= maxA;

          if (volumeOverlap) {
            const motivo =
              ruleA.type === 'GOAL'
                ? 'Meta idéntica'
                : 'Rango de pedidos solapado';
            this.showConflictError(
              ruleA,
              ruleB,
              `${motivo} para el mismo periodo.`,
            );
            return true;
          }
        }
      }
    }
    return false;
  }

  private showConflictError(r1: any, r2: any, mensaje: string) {
    this.snackBar.open(`⚠️ Conflicto detectado: ${mensaje}`, 'Cerrar', {
      duration: 6000,
      panelClass: ['error-snackbar'],
    });
  }

  get roleControl(): FormControl {
    return this.userForm.get('role') as FormControl;
  }

  handleRoleChange(role: string): void {}

  private initForm(): void {
    this.userForm = this.fb.group({
      id: [null],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []],
      role: [UserRole.COMPANY],
      driverCode: ['', []],

      business_type: ['', []],
      business_name: ['', []],
      business_district: ['', []],
      business_address: ['', []],
      business_phone_number: ['', []],
      business_sector: ['', []],
      business_document_type: ['', []],
      business_email: ['', []],
      assumes_5_percent_pos: [false, []],
      business_document_number: ['', []],

      owner_name: ['', []],
      owner_phone_number: ['', []],
      owner_document_type: ['', []],
      owner_document_number: ['', []],
      owner_email_address: ['', []],

      owner_bank_account: ['', []],
      name_account_number_owner: ['', []],
      isVolumeDiscountEnabled: [false, []],
      assignedVolumeDiscountRuleIds: [[], []],
    });
  }

  get username() {
    return this.userForm.get('username');
  }
  get email() {
    return this.userForm.get('email');
  }

  allRules: VolumeDiscountRule[] = [];

  onSubmit(): void {
    if (this.userForm.get('isVolumeDiscountEnabled')?.value) {
      if (this.hasRuleConflict()) {
        return;
      }
    }
    if (this.userForm.valid) {
      if (this.userToEdit && this.userToEdit.id) {
        const formData: User = {
          ...(this.userToEdit as User),
          ...this.userForm.value,
          id: this.userToEdit.id,
        };
        this.formSubmit.emit(formData);
      } else {
        const { id, ...formDataWithoutId } = this.userForm.value;
        this.formSubmit.emit(formDataWithoutId as Omit<User, 'id'>);
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
