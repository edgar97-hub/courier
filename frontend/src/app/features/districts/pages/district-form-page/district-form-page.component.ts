import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon'; // Para el botón de volver
import { MatButtonModule } from '@angular/material/button'; // Para el botón de volver
import { Observable, Subject, of, EMPTY } from 'rxjs';
import { switchMap, takeUntil, catchError, tap } from 'rxjs/operators';

import { DistrictFormComponent } from '../../components/district-form/district-form.component';
import { DistrictService } from '../../services/district.service';
import { District } from '../../models/district.model';

@Component({
  selector: 'app-district-form-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Para routerLink del botón de volver
    DistrictFormComponent,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './district-form-page.component.html',
  styleUrls: ['./district-form-page.component.scss'],
})
export class DistrictFormPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private districtService = inject(DistrictService);
  private snackBar = inject(MatSnackBar);

  districtToEdit$: Observable<District | null> = of(null);
  isLoading = false; // Para la carga inicial del distrito a editar
  isSaving = false; // Para la operación de guardado/actualización
  pageTitle = 'Crear Nuevo Distrito/Tarifa';
  districtId: string | number | null = null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.districtId = this.route.snapshot.paramMap.get('id');
    console.log(
      'DistrictFormPage - ngOnInit - districtId from route:',
      this.districtId
    );

    if (this.districtId) {
      this.pageTitle = 'Editar Distrito/Tarifa';
      this.isLoading = true;
      this.districtToEdit$ = this.districtService
        .getDistrictById(this.districtId)
        .pipe(
          // Esto devuelve el Observable
          takeUntil(this.destroy$),
          tap((district) => {
            console.log(
              'COMPONENT: Received district data in tap():',
              district
            );
            if (!district) {
              // Si la API devuelve null o undefined por alguna razón
              this.snackBar.open(
                'No se encontraron datos para el distrito.',
                'Cerrar',
                { duration: 5000, panelClass: ['error-snackbar'] }
              );
              this.router.navigate(['/districts']);
            }
            this.isLoading = false;
          }),
          catchError((err) => {
            this.isLoading = false;
            this.snackBar.open(
              `Error cargando distrito: ${err.message || 'Intente de nuevo'}`,
              'Cerrar',
              { duration: 5000, panelClass: ['error-snackbar'] }
            );
            this.router.navigate(['/districts']);
            return of(null);
          })
        );
      this.districtToEdit$.subscribe({
        next: (data) =>
          console.log('COMPONENT (MANUAL SUB): Data received:', data),
        error: (err) =>
          console.error('COMPONENT (MANUAL SUB): Error received:', err),
        complete: () =>
          console.log('COMPONENT (MANUAL SUB): Observable completed.'),
      });
    } else {
      this.pageTitle = 'Crear Nuevo Distrito/Tarifa';
      this.districtToEdit$ = of(null);
      this.isLoading = false; // No hay carga inicial de datos en modo creación
    }
  }

  handleSubmit(
    districtData: Omit<District, 'id' | 'createdAt' | 'updatedAt'>
  ): void {
    this.isSaving = true;
    let operation$: Observable<District>;

    if (this.districtId) {
      // Modo Edición
      operation$ = this.districtService.updateDistrict(
        this.districtId,
        districtData
      );
    } else {
      // Modo Creación
      operation$ = this.districtService.createDistrict(districtData);
    }

    operation$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (savedDistrict) => {
        this.isSaving = false;
        const action = this.districtId ? 'actualizado' : 'creado';
        this.snackBar.open(`${action} correctamente.`, 'OK', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.router.navigate(['/districts']); // Volver a la lista
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(
          `Error al guardar distrito: ${err.message || 'Intente de nuevo'}`,
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['error-snackbar'],
          }
        );
      },
    });
  }

  handleCancel(): void {
    this.router.navigate(['/districts']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
