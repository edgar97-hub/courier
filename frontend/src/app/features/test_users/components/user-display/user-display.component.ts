import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, etc.
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { UserRole } from '../../../../common/roles.enum';
// Asume que tienes un modelo User similar a la estructura de tu userForm
// Si no, puedes usar 'any' para el tipo del input, pero es mejor tener un modelo.
export interface UserFormData {
  // O importa tu modelo User si ya existe
  username: string;
  email: string;
  password?: string; // Generalmente no se muestra
  role?: string;
  business_type?: string;
  business_name?: string;
  business_district?: string;
  business_address?: string;
  business_phone_number?: string;
  business_sector?: string;
  business_document_type?: string;
  business_email?: string;
  business_document_number?: string;
  assumes_5_percent_pos?: boolean;
  owner_name?: string;
  owner_phone_number?: string;
  owner_document_type?: string;
  owner_document_number?: string;
  owner_email_address?: string;
  owner_bank_account?: string;
  name_account_number_owner?: string;
}

@Component({
  selector: 'app-user-display', // Nuevo selector
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule],
  templateUrl: './user-display.component.html', // Nuevo archivo HTML
  styleUrls: ['./user-display.component.scss'], // Nuevo archivo SCSS
})
export class UserDisplayComponent {
  @Input() userData!: UserFormData | null; // Recibe los datos del usuario

  // Para la lógica condicional de secciones basada en el rol del usuario mostrado
  get isCompanyRole(): boolean {
    return (
      this.userData?.role === UserRole.COMPANY ||
      this.userData?.role === UserRole.EMPRESA_DISTRIBUIDOR
    );
  }

  // Helper para mostrar 'Sí' o 'No' para booleanos
  formatBoolean(value: boolean | undefined): string {
    if (value === undefined || value === null) return 'N/A';
    return value ? 'Sí' : 'No';
  }
}
