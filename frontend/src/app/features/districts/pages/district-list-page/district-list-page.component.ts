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
import { MatCardModule } from '@angular/material/card';

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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
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

  currentPageIndex = 0;
  currentPageSize = 10;
  currentSortField = 'name';
  currentSortDirection: 'asc' | 'desc' = 'asc';
  currentSearchTerm = '';

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadDistricts();

    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.currentSearchTerm = searchTerm;
        this.currentPageIndex = 0;
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
    inputElement.value = '';
    this.searchSubject.next('');
  }

  onPageChanged(event: PageEvent): void {
    this.currentPageIndex = event.pageIndex;
    this.currentPageSize = event.pageSize;
    this.loadDistricts();
  }

  onSortChanged(event: Sort): void {
    this.currentSortField = event.active;
    this.currentSortDirection = event.direction as 'asc' | 'desc';
    this.currentPageIndex = 0;
    this.loadDistricts();
  }

  navigateToCreate(): void {
    this.router.navigate(['/districts/create']);
  }

  navigateToEdit(district: District): void {
    this.router.navigate(['/districts/edit', district.id]);
  }

  confirmAndDeleteDistrict(district: District): void {
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
    this.isLoading = true;
    this.districtService
      .deleteDistrict(district.id)
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
          this.currentPageIndex = 0;
          this.isLoading = false;
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
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
