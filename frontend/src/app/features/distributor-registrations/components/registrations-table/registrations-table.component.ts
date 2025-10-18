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

  @Output() edit = new EventEmitter<DistributorRegistration>();
  @Output() delete = new EventEmitter<string>();
  @Output() print = new EventEmitter<string>();
  showActions: boolean = false;
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
  dataSource = new MatTableDataSource<DistributorRegistration>();

  resultsLength = 0;
  isLoadingResults = true;

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
      this.fetchData();
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
    if (!this.sort || !this.paginator) return;

    // Cuando el usuario ordena, siempre volvemos a la primera página.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.fetchData();

    // El 'merge' ahora solo se encarga de DISPARAR la llamada a la API.
    merge(this.sort.sortChange, this.paginator.page, this.search$)
      .pipe(startWith({}), takeUntil(this.destroy$))
      .subscribe(() => this.fetchData());
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

  private fetchData(): void {
    this.isLoadingResults = true;
    this.registrationService
      .getMyRegistrationsPaginated(
        this.paginator.pageIndex + 1,
        this.paginator.pageSize,
        this.sort?.active || 'createdAt',
        this.sort?.direction.toUpperCase() || 'DESC',
        this._searchTerm
      )
      .pipe(
        catchError(() => {
          this.isLoadingResults = false;
          return of(null);
        })
      )
      .subscribe((data) => {
        this.isLoadingResults = false;
        if (data) {
          this.resultsLength = data.total;
          this.dataSource.data = data.data;
        } else {
          this.dataSource.data = [];
          this.resultsLength = 0;
        }
      });
  }

  public reloadData(): void {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
