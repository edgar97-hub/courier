import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Importaciones de Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Importaciones de nuestro módulo
import { DistributorRegistrationService } from '../../services/distributor-registration.service';
import { AppStore } from '../../../../app.store';

// Importar los componentes hijos que vamos a orquestar
import { FilterToolbarComponent } from '../../components/filter-toolbar/filter-toolbar.component';
import { RegistrationsTableComponent } from '../../components/registrations-table/registrations-table.component';
import { RegistrationFormDialogComponent } from '../../components/registration-form-dialog/registration-form-dialog.component';
import { DistributorImportDialogComponent } from '../../components/distributor-import-dialog/distributor-import-dialog.component';
import { Subject } from 'rxjs';
import { DistributorRegistration } from '../../models/distributor-registration.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserRole } from '../../../../common/roles.enum';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-registration-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatDialogModule,
    // Componentes hijos
    FilterToolbarComponent,
    RegistrationsTableComponent,
  ],
  templateUrl: './registration-page.component.html',
  styleUrls: ['./registration-page.component.scss'],
})
export class RegistrationPageComponent {
  private registrationService = inject(DistributorRegistrationService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  public appStore = inject(AppStore);

  @ViewChild(RegistrationsTableComponent)
  private registrationsTable!: RegistrationsTableComponent;

  searchTerm = signal<string>('');
  isUploading = signal<boolean>(false);

  isAdminOrReceptionist = signal<boolean>(false);

  onRefreshTable(): void {
    this.snackBar.open('Actualizando lista de registros...', '', {
      duration: 2000,
    });
    if (this.registrationsTable) {
      this.registrationsTable.reloadData();
    }
  }

  ngAfterViewInit(): void {
    this.onRefreshTable();

    const userRole = this.appStore.currentUser()?.role;
    if (userRole === UserRole.ADMIN || userRole === UserRole.RECEPTIONIST) {
      this.isAdminOrReceptionist.set(true);
    }
  }

  onSearchChanged(term: string): void {
    console.log('term', term);
    this.searchTerm.set(term);
  }

  openManualRegistrationDialog(): void {
    const dialogRef = this.dialog.open(RegistrationFormDialogComponent, {
      width: '600px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any | undefined) => {
      if (result) {
        this.registrationService.createRegistration(result).subscribe({
          next: () => {
            this.snackBar.open('Registro creado con éxito.', 'OK', {
              duration: 3000,
            });
            // Le decimos a la tabla que se recargue para mostrar el nuevo registro
            if (this.registrationsTable) {
              this.registrationsTable.reloadData();
            }
          },
          error: (err) =>
            this.snackBar.open(
              `Error al crear el registro: ${err.message}`,
              'Cerrar'
            ),
        });
      }
    });
  }
  handleEdit(registration: DistributorRegistration): void {
    const dialogRef = this.dialog.open(RegistrationFormDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { registration },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.registrationService
          .updateRegistration(registration.id, result)
          .subscribe({
            next: () => {
              this.snackBar.open('Registro actualizado con éxito.', 'OK', {
                duration: 3000,
              });
              this.registrationsTable.reloadData();
            },
            error: (err: any) =>
              this.snackBar.open(
                `Error al actualizar: ${err.message}`,
                'Cerrar'
              ),
          });
      }
    });
  }

  handleDelete(id: string): void {
    const dialogData: any = {
      title: 'Confirmar Eliminación',
      message:
        '¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'warn',
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.registrationService.deleteRegistration(id).subscribe({
          next: () => {
            this.snackBar.open('Registro eliminado con éxito.', 'OK', {
              duration: 3000,
            });
            this.registrationsTable.reloadData();
          },
          error: (err: any) =>
            this.snackBar.open(`Error al eliminar: ${err.message}`, 'Cerrar'),
        });
      }
    });
  }
  handlePrint(id: string): void {
    const pdfUrl =
      environment.apiUrl + '/distributor-records/' + id + '/pdf-rotulado';
    window.open(pdfUrl, '_blank');
  }

  openMassiveImportDialog(): void {
    const dialogRef = this.dialog.open(DistributorImportDialogComponent, {
      width: '600px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.onRefreshTable();
      }
    });
  }
}
