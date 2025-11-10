import {
  Component,
  Input,
  ViewChild,
  AfterViewInit,
  inject,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, merge, of, Subscription } from 'rxjs';
import {
  startWith,
  switchMap,
  catchError,
  map,
  takeUntil,
} from 'rxjs/operators';
import { DistributorRegistrationService } from '../../services/distributor-registration.service';
import { DistributorRegistration } from '../../models/distributor-registration.model';
import { AppStore } from '../../../../app.store';
import { MatIconModule } from '@angular/material/icon';
import { UserRole } from '../../../../common/roles.enum';

@Component({
  selector: 'app-registrations-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './registrations-table.component.html',
  styleUrls: ['./registrations-table.component.scss'],
})
export class RegistrationsTableComponent implements AfterViewInit, OnDestroy {
  private registrationService = inject(DistributorRegistrationService);
  private appStore = inject(AppStore);

  // --- ENTRADAS (INPUTS) ---
  @Input() dataSource: DistributorRegistration[] = [];
  @Input() resultsLength = 0;
  @Input() isLoadingResults = true;
  @Input() showActions = false;

  // --- SALIDAS (OUTPUTS) ---
  @Output() paramsChanged = new EventEmitter<{
    page: number;
    pageSize: number;
    sort: string;
    sortDirection: string;
  }>();
  @Output() edit = new EventEmitter<DistributorRegistration>();
  @Output() delete = new EventEmitter<string>();
  @Output() print = new EventEmitter<string>();

  private destroy$ = new Subject<void>();
  displayedColumns: string[] = [
    'code',
    'user',
    'createdAt',
    'clientName',
    'clientDni',
    'clientPhone',
    'destinationAddress',
    'observation',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private search$ = new Subject<void>();

  @Input()
  set searchTerm(term: string) {
    this._searchTerm = term;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      console.log(this._searchTerm);
      this.search$.next();
    }
  }
  private _searchTerm: string = '';

  ngOnInit(): void {
    // Comprobamos el rol del usuario al inicializar el componente
    const userRole = this.appStore.currentUser()?.role;
    if (userRole === UserRole.ADMIN || userRole === UserRole.RECEPTIONIST) {
      this.showActions = true;
      // Añadimos la columna 'actions' a la tabla si el rol es el correcto
      this.displayedColumns.push('actions');
    }
  }

  ngAfterViewInit() {
    // Envolvemos toda la lógica en un setTimeout para asegurar que
    // this.sort y this.paginator hayan sido inicializados por Angular.
    setTimeout(() => {
      if (!this.sort || !this.paginator) {
        console.error('ERROR: MatSort o MatPaginator no se encontraron.');
        return;
      }

      // A partir de aquí, es seguro asumir que this.sort y this.paginator existen.

      // Cuando el usuario ordena, siempre volvemos a la primera página.
      this.sort.sortChange.subscribe(() => {
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
      });

      // Unimos los eventos del paginador y el sort en un solo stream de salida
      merge(this.sort.sortChange, this.paginator.page)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          console.log('Evento de tabla detectado! Emitiendo params...');
          this.emitParams();
        });
    });
  }

  emitParams(): void {
    this.paramsChanged.emit({
      page: this.paginator.pageIndex + 1,
      pageSize: this.paginator.pageSize,
      sort: this.sort.active || 'createdAt',
      sortDirection: this.sort.direction.toUpperCase() || 'DESC',
    });
  }

  onEdit(registration: DistributorRegistration): void {
    this.edit.emit(registration);
  }

  onDelete(id: string): void {
    this.delete.emit(id);
  }

  onPrint(id: string): void {
    this.print.emit(id);
  }

  // private fetchData(): void {
  //   this.isLoadingResults = true;
  //   this.registrationService
  //     .getMyRegistrationsPaginated(
  //       this.paginator?.pageIndex + 1 || 1, // Usar 1 si el paginador no está listo
  //       this.paginator?.pageSize || 10, // Usar 10 por defecto
  //       this.sort?.active || 'createdAt',
  //       this.sort?.direction.toUpperCase() || 'DESC',
  //       this._searchTerm
  //     )
  //     .pipe(
  //       takeUntil(this.destroy$), // Asegurarse de cancelar si el componente se destruye
  //       catchError(() => {
  //         this.isLoadingResults = false;
  //         return of(null);
  //       })
  //     )
  //     .subscribe((data) => {
  //       this.isLoadingResults = false;
  //       if (data) {
  //         this.resultsLength = data.total;
  //         this.dataSource = data.data; // Asignación a nuestro array simple
  //       } else {
  //         this.dataSource = [];
  //         this.resultsLength = 0;
  //       }
  //     });
  // }

  // public reloadData(): void {
  //   this.fetchData();
  // }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
