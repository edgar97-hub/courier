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
import { catchError, of, Subject, tap } from 'rxjs';
import { DistributorRegistration } from '../../models/distributor-registration.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserRole } from '../../../../common/roles.enum';
import { environment } from '../../../../../environments/environment';
import {
  DateRangeFilterComponent,
  DateRange,
} from '../../components/date-range-filter/date-range-filter.component'; // <-- Importa el nuevo componente

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
    DateRangeFilterComponent,
  ],
  templateUrl: './registration-page.component.html',
  styleUrls: ['./registration-page.component.scss'],
})
export class RegistrationPageComponent {
  private registrationService = inject(DistributorRegistrationService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  public appStore = inject(AppStore);

  isAdminOrReceptionist = signal<boolean>(false);

  // --- ESTADO DE LA PÁGINA ---
  registrations = signal<DistributorRegistration[]>([]);
  resultsLength = signal(0);
  isLoading = signal(true);

  // --- PARÁMETROS DE LA CONSULTA ---
  private currentPage = 1;
  private pageSize = 10; // O el valor inicial que prefieras
  private sort = 'createdAt';
  private sortDirection = 'DESC';
  private searchTerm = '';
  private startDate: Date | null = null; // <-- Nueva propiedad
  private endDate: Date | null = null; // <-- Nueva propiedad

  ngOnInit(): void {
    const userRole = this.appStore.currentUser()?.role;
    if (userRole === UserRole.ADMIN || userRole === UserRole.RECEPTIONIST) {
      this.isAdminOrReceptionist.set(true);
    }
    const today = new Date();
    this.startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0
    );
    this.endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );
    this.fetchData(); // Carga inicial
  }

  onDateRangeChanged(range: DateRange): void {
    console.log('Fechas recibidas del hijo:', range);
    this.startDate = range.start;
    this.endDate = range.end;
    this.currentPage = 1;
    this.fetchData();
  }

  onSearchChanged(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1; // Volver a la primera página en cada búsqueda
    this.fetchData();
  }

  onTableParamsChanged(params: {
    page: number;
    pageSize: number;
    sort: string;
    sortDirection: string;
  }): void {
    this.currentPage = params.page;
    this.pageSize = params.pageSize;
    this.sort = params.sort;
    this.sortDirection = params.sortDirection;
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading.set(true);
    this.registrationService
      .getMyRegistrationsPaginated(
        this.currentPage,
        this.pageSize,
        this.sort,
        this.sortDirection,
        this.searchTerm,
        this.startDate,
        this.endDate
      )
      .pipe(
        tap((data) => {
          this.isLoading.set(false);
          if (data) {
            this.registrations.set(data.data);
            this.resultsLength.set(data.total);
          } else {
            this.registrations.set([]);
            this.resultsLength.set(0);
          }
        }),
        catchError(() => {
          this.isLoading.set(false);
          this.registrations.set([]);
          this.resultsLength.set(0);
          this.snackBar.open('Error al cargar los registros.', 'Cerrar');
          return of(null);
        })
      )
      .subscribe();
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
            this.fetchData();
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
              this.fetchData();
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
            this.fetchData();
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
        this.fetchData();
      }
    });
  }
}
