import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import {
  Observable,
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { DistrictTableComponent } from '../../components/district-table/district-table.component';
import { DistrictService } from '../../services/district.service';
import { District } from '../../models/district.model';
// Necesitarás un componente de diálogo de confirmación genérico o uno específico
// import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatCardModule } from '@angular/material/card'; // Añadir si no está

interface TableLoadParams {
  pageIndex: number;
  pageSize: number;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  searchTerm?: string;
}

@Component({
  selector: 'app-district-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DistrictTableComponent,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule, // Para el diálogo de confirmación
    MatFormFieldModule, // Para el campo de búsqueda
    MatInputModule, // Para el campo de búsqueda
    MatCardModule, // Añadido
  ],
  templateUrl: './district-list-page.component.html',
  styleUrls: ['./district-list-page.component.scss'],
})
export class DistrictListPageComponent implements OnInit, OnDestroy {
  private districtService = inject(DistrictService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  districts: District[] = [];
  totalDistricts = 0;
  isLoading = false;
  private destroy$ = new Subject<void>();

  // Para el control de la tabla y la API
  currentPageIndex = 0;
  currentPageSize = 10;
  currentSortField = 'name'; // Campo por defecto para ordenar
  currentSortDirection: 'asc' | 'desc' = 'asc';
  currentSearchTerm = '';

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadDistricts();

    // Manejo de búsqueda con debounce
    this.searchSubject
      .pipe(
        debounceTime(500), // Espera 500ms después del último input
        distinctUntilChanged(), // Solo emite si el valor cambió
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        this.currentSearchTerm = searchTerm;
        this.currentPageIndex = 0; // Resetear a la primera página con nueva búsqueda
        this.loadDistricts();
      });
  }

  loadDistricts(): void {
    this.isLoading = true;
    this.districtService
      .getDistricts(
        this.currentPageIndex,
        this.currentPageSize,
        this.currentSortField,
        this.currentSortDirection,
        this.currentSearchTerm
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.districts = response.items;
          this.totalDistricts = response.total_count;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(
            `Error cargando distritos: ${err.message || 'Intente de nuevo'}`,
            'Cerrar',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            }
          );
        },
      });
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  clearSearch(inputElement: HTMLInputElement): void {
    inputElement.value = ''; // Limpia el input visualmente
    this.searchSubject.next(''); // Emite un string vacío para resetear la búsqueda
  }

  onPageChanged(event: PageEvent): void {
    this.currentPageIndex = event.pageIndex;
    this.currentPageSize = event.pageSize;
    this.loadDistricts();
  }

  onSortChanged(event: Sort): void {
    this.currentSortField = event.active;
    this.currentSortDirection = event.direction as 'asc' | 'desc';
    this.currentPageIndex = 0; // Resetear a la primera página con nuevo ordenamiento
    this.loadDistricts();
  }

  navigateToCreate(): void {
    this.router.navigate(['/configuracion/districts/create']);
  }

  navigateToEdit(district: District): void {
    this.router.navigate(['/configuracion/districts/edit', district.id]);
  }

  confirmAndDeleteDistrict(district: District): void {
    // const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    //   width: '350px',
    //   data: {
    //     title: 'Confirmar Eliminación',
    //     message: `¿Está seguro de que desea eliminar el distrito/tarifa "${district.name}" (Código: ${district.code || district.id})? Esta acción no se puede deshacer.`
    //   } as ConfirmDialogData
    // });

    // dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
    //   if (result === true) { // Si el usuario confirma
    //     this.deleteDistrict(district);
    //   }
    // });

    // --- SIMULACIÓN SIN DIÁLOGO DE CONFIRMACIÓN POR AHORA ---
    // En producción, SIEMPRE usa un diálogo de confirmación.
    if (
      confirm(
        `¿Está seguro de que desea eliminar el distrito/tarifa "${
          district.name
        }" (Código: ${district.code || district.id})?`
      )
    ) {
      this.deleteDistrict(district);
    }
  }

  private deleteDistrict(district: District): void {
    this.isLoading = true; // O una bandera específica para la operación de borrado
    this.districtService
      .deleteDistrict(district.id) // Asumiendo que 'id' es el identificador
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Distrito "${district.name}" eliminado correctamente.`,
            'OK',
            {
              duration: 3000,
              panelClass: ['success-snackbar'],
            }
          );
          // Recargar la lista para reflejar la eliminación
          // Podrías optimizar esto si tu API devuelve el total actualizado o si manejas el borrado localmente
          this.currentPageIndex = 0; // Volver a la primera página podría ser necesario
          this.loadDistricts();
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(
            `Error al eliminar distrito: ${err.message || 'Intente de nuevo'}`,
            'Cerrar',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            }
          );
        },
        // complete: () => this.isLoading = false; // Se maneja en next y error
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
