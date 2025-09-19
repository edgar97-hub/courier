import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  FormControl,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CashManagementService } from '../../services/cash-management.service';
import {
  CashMovement,
  DetailedCashMovementSummary,
  CashMovementQuery,
} from '../../models/cash-movement.model';
import { firstValueFrom, Observable, of, Subject } from 'rxjs';
import { format } from 'date-fns';
import { CashMovementFormComponent } from '../../components/cash-movement-form/cash-movement-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  takeUntil,
} from 'rxjs/operators';
import { MatMenuModule } from '@angular/material/menu';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { environment } from '../../../../../environments/environment';
import { ExcelExportService } from '../../../../features/listaCierreCaja/services/excel-export.service'; // Import ExcelExportService
import { AppStore } from '../../../../app.store';

@Component({
  selector: 'app-cash-management-list-page',
  standalone: true,
  providers: [DatePipe],
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    ConfirmDialogComponent, 
    MatMenuModule,
  ],
  templateUrl: './cash-management-list-page.component.html',
  styleUrls: ['./cash-management-list-page.component.scss'],
})
export class CashManagementListPageComponent implements OnInit, AfterViewInit {
  appStore = inject(AppStore);

  filterForm: FormGroup;
  summaryFilterForm: FormGroup;
  displayedColumns: string[] = [
    'code',
    'date',
    'typeMovement',
    'amount',
    'paymentsMethod',
    'description',
    'user',
    'actions',
  ];

  paymentMethods: string[] = [
    'Efectivo',
    'Yape/Transferencia BCP',
    'Plin/Transferencia INTERBANK',
    'POS',
  ];

  cashMovements: MatTableDataSource<CashMovement> =
    new MatTableDataSource<CashMovement>([]);
  summary$: Observable<DetailedCashMovementSummary> = of({
    Efectivo: { income: 0, expense: 0, balance: 0 },
    'Yape/Transferencia BCP': { income: 0, expense: 0, balance: 0 },
    'Plin/Transferencia INTERBANK': { income: 0, expense: 0, balance: 0 },
    POS: { income: 0, expense: 0, balance: 0 },
    totalCashIncome: 0,
    totalCashExpense: 0,
    totalCashBalance: 0,
  });

  totalItems: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;
  private datePipe = inject(DatePipe);

  isLoadingResults: boolean = false;
  isLoadingSummary: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cashManagementService: CashManagementService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private excelExportService: ExcelExportService // Inject ExcelExportService
  ) {
    const today = new Date();
    this.filterForm = this.fb.group({
      startDate: [today],
      endDate: [today],
      typeMovement: [''],
      paymentsMethod: [''],
      userId: [''],
      search: [''],
    });

    this.summaryFilterForm = this.fb.group({
      startDate: [today],
      endDate: [today],
    });
  }

  ngOnInit(): void {
    this.fetchCashMovements(this.filterForm.value);
    this.fetchCashMovementSummary(this.summaryFilterForm.value);

    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe((formValues) => {
        this.fetchCashMovements(formValues);
      });

    this.summaryFilterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe((formValues) => {
        this.fetchCashMovementSummary(formValues);
      });
  }

  ngAfterViewInit(): void {
    this.cashMovements.sort = this.sort;
    this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.pageNumber = 1; // Reset page to 1 when sort changes
      this.applyFilters();
    });
  }

  fetchCashMovements(
    formValues: any,
    orderBy?: string,
    orderDirection?: string
  ): void {
    const filters: CashMovementQuery = { ...formValues };

    if (filters.startDate) {
      filters.startDate =
        this.datePipe.transform(filters.startDate, 'yyyy-MM-dd') || '';
    }
    if (filters.endDate) {
      filters.endDate =
        this.datePipe.transform(filters.endDate, 'yyyy-MM-dd') || '';
    }
    if (filters.search) {
      filters.search = filters.search.trim();
    }
    this.isLoadingResults = true;
    this.cashManagementService
      .getAllCashMovements(
        filters,
        this.pageNumber,
        this.pageSize,
        orderBy,
        orderDirection
      )
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cashMovements = new MatTableDataSource<CashMovement>(
          response.movements
        );
        this.totalItems = response.total;
        this.cashMovements.sort = this.sort;
      });
  }

  fetchCashMovementSummary(formValues: any): void {
    const filters: CashMovementQuery = { ...formValues };

    if (filters.startDate) {
      filters.startDate =
        this.datePipe.transform(filters.startDate, 'yyyy-MM-dd') || '';
    }
    if (filters.endDate) {
      filters.endDate =
        this.datePipe.transform(filters.endDate, 'yyyy-MM-dd') || '';
    }

    this.isLoadingSummary = true;
    this.summary$ = this.cashManagementService
      .getCashMovementSummary(filters)
      .pipe(finalize(() => (this.isLoadingSummary = false)));
  }

  applyFilters(): void {
    this.fetchCashMovements(
      this.filterForm.value,
      this.sort?.active,
      this.sort?.direction
    );
  }

  applySummaryFilters(): void {
    this.fetchCashMovementSummary(this.summaryFilterForm.value);
  }

  onPageChange(event: any): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.applyFilters();
  }

  openAddMovementDialog(): void {
    const dialogRef = this.dialog.open(CashMovementFormComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.applyFilters();
      }
    });
  }

  editMovement(movement: CashMovement): void {
    const dialogRef = this.dialog.open(CashMovementFormComponent, {
      width: '400px',
      data: movement,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.applyFilters();
      }
    });
  }

  deleteMovement(id: string): void {
    const dialogData: ConfirmDialogData = {
      title: 'Confirmar Eliminación',
      message:
        '¿Estás seguro de que quieres eliminar este movimiento de caja? Esta acción no se puede deshacer.',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'warn',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // If user confirmed deletion
        this.cashManagementService.deleteCashMovement(id).subscribe({
          next: () => {
            this.snackBar.open('Movimiento eliminado exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.applyFilters();
          },
          error: (error) => {
            this.snackBar.open(
              'Error al eliminar movimiento: ' + error.message,
              'Cerrar',
              { duration: 3000 }
            );
            console.error('Error deleting cash movement:', error);
          },
        });
      }
    });
  }

  generatePdf(id: string): void {
    const pdfUrl =
      environment.apiUrl + '/cash-management/' + id + '/pdf/ticket';
    window.open(pdfUrl, '_blank');
  }
  async exportCashMovementsToExcel(): Promise<void> {
    const tableFilters: CashMovementQuery = this.filterForm.value;
    const summaryFilters: CashMovementQuery = this.summaryFilterForm.value;

    if (tableFilters.startDate) {
      tableFilters.startDate =
        this.datePipe.transform(tableFilters.startDate, 'yyyy-MM-dd') || '';
    }
    if (tableFilters.endDate) {
      tableFilters.endDate =
        this.datePipe.transform(tableFilters.endDate, 'yyyy-MM-dd') || '';
    }

    if (summaryFilters.startDate) {
      summaryFilters.startDate =
        this.datePipe.transform(summaryFilters.startDate, 'yyyy-MM-dd') || '';
    }
    if (summaryFilters.endDate) {
      summaryFilters.endDate =
        this.datePipe.transform(summaryFilters.endDate, 'yyyy-MM-dd') || '';
    }

    // Fetch all movements (assuming a large page size is sufficient for export)
    const movementsObservable = this.cashManagementService.getAllCashMovements(
      tableFilters,
      1,
      999999
    ); // Fetch all movements using table filters
    const movementsResponse = await firstValueFrom(movementsObservable);
    const movements = movementsResponse?.movements || [];

    // Fetch detailed summary using summary filters
    const summaryObservable =
      this.cashManagementService.getCashMovementSummary(summaryFilters);
    const summary = await firstValueFrom(summaryObservable);

    const summaryForExcel: any[] = [];
    const movementsForExcel: any[] = [];

    // Prepare summary data
    summaryForExcel.push({
      label: 'Fecha Inicio',
      value: this.datePipe.transform(summaryFilters.startDate, 'dd/MM/yyyy'),
    });
    summaryForExcel.push({
      label: 'Fecha Fin',
      value: this.datePipe.transform(summaryFilters.endDate, 'dd/MM/yyyy'),
    });

    if (summary) {
      const paymentMethods = [
        'Efectivo',
        'Yape/Transferencia BCP',
        'Plin/Transferencia INTERBANK',
        'POS',
      ];

      paymentMethods.forEach((key) => {
        const paymentMethodSummary =
          summary[key as keyof DetailedCashMovementSummary];
        if (paymentMethodSummary && typeof paymentMethodSummary === 'object') {
          summaryForExcel.push({
            Tipo: key,
            Ingreso: paymentMethodSummary.income.toFixed(2),
            Egreso: paymentMethodSummary.expense.toFixed(2),
            Saldo: paymentMethodSummary.balance.toFixed(2),
          });
        }
      });

      summaryForExcel.push({
        label: 'Total Ingresos',
        value: parseFloat(summary.totalCashIncome.toFixed(2)),
      });
      summaryForExcel.push({
        label: 'Total Egresos',
        value: parseFloat(summary.totalCashExpense.toFixed(2)),
      });
      summaryForExcel.push({
        label: 'Saldo Total',
        value: parseFloat(summary.totalCashBalance.toFixed(2)),
      });
    }

    // Prepare movements data
    movements.forEach((movement) => {
      movementsForExcel.push({
        'N°': movement.code,
        Fecha: this.datePipe.transform(movement.date, 'dd/MM/yyyy'),
        Tipo: movement.typeMovement,
        Monto: parseFloat(movement.amount.toFixed(2)),
        'Forma de Pago': movement.paymentsMethod,
        Descripción: movement.description,
        Usuario: movement.user?.username || movement.user?.email,
      });
    });

    const fileName = `movimientos_caja_${this.datePipe.transform(
      new Date(),
      'yyyyMMdd_HHmmss'
    )}`;
    this.excelExportService.exportCashMovementSummaryAndDetailsToExcel(
      summaryForExcel,
      movementsForExcel,
      fileName,
      'Movimientos de Caja',
      this.datePipe.transform(tableFilters.startDate, 'dd/MM/yyyy') || '',
      this.datePipe.transform(tableFilters.endDate, 'dd/MM/yyyy') || ''
    );
  }

  isReceptionist(): boolean {
    const userRole = this.appStore.currentUser()?.role;
    return userRole === 'RECEPCIONISTA';
  }

  isReceptionistOrAdmin(): boolean {
    const userRole = this.appStore.currentUser()?.role;
    return userRole === 'RECEPCIONISTA' || userRole === 'ADMINISTRADOR';
  }
}
