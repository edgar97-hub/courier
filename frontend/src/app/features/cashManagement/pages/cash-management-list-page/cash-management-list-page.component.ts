import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { Observable, of } from 'rxjs';
import { format } from 'date-fns';
import { CashMovementFormComponent } from '../../components/cash-movement-form/cash-movement-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';
import { MatMenuModule } from '@angular/material/menu';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

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
    ConfirmDialogComponent, // Correctly imported as a standalone component
    MatMenuModule,
  ],
  templateUrl: './cash-management-list-page.component.html',
  styleUrls: ['./cash-management-list-page.component.scss'],
})
export class CashManagementListPageComponent implements OnInit {
  filterForm: FormGroup;
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

  summaryDisplayedColumns: string[] = ['type', 'Efectivo', 'Yape/Transferencia BCP', 'Plin/Transferencia INTERBANK', 'POS'];
  cashMovements$: Observable<CashMovement[]> = of([]);
  summary$: Observable<DetailedCashMovementSummary> = of({
    Efectivo: { income: 0, expense: 0, balance: 0 },
    'Yape/Transferencia BCP': { income: 0, expense: 0, balance: 0 },
    'Plin/Transferencia INTERBANK': { income: 0, expense: 0, balance: 0 },
    POS: { income: 0, expense: 0, balance: 0 },
    totalCashIncome: 0,
    totalCashExpense: 0,
    totalCashBalance: 0,
  });

  summaryTableDataSource: any[] = [];

  totalItems: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;
  private datePipe = inject(DatePipe);

  isLoadingResults: boolean = false;
  isLoadingSummary: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private cashManagementService: CashManagementService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    const today = new Date();
    this.filterForm = this.fb.group({
      startDate: [today],
      endDate: [today],
      typeMovement: [''],
      paymentsMethod: [''],
      userId: [''],
    });
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const filters: CashMovementQuery = this.filterForm.value;

    if (filters.startDate) {
      filters.startDate =
        this.datePipe.transform(filters.startDate, 'yyyy-MM-dd') || '';
    }
    if (filters.endDate) {
      filters.endDate =
        this.datePipe.transform(filters.endDate, 'yyyy-MM-dd') || '';
    }

    this.isLoadingResults = true;
    this.cashManagementService
      .getAllCashMovements(filters, this.pageNumber, this.pageSize)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cashMovements$ = of(response.movements);
        this.totalItems = response.total;
      });

    this.isLoadingSummary = true;
    this.summary$ = this.cashManagementService
      .getCashMovementSummary(filters)
      .pipe(finalize(() => (this.isLoadingSummary = false)));

    this.summary$.subscribe((summary) => {
      this.summaryTableDataSource = this.getSummaryTableDataSource(summary);
    });
  }

  private getSummaryTableDataSource(summary: DetailedCashMovementSummary): any[] {
    return [
      {
        type: 'Ingreso',
        Efectivo: summary.Efectivo.income,
        'Yape/Transferencia BCP': summary['Yape/Transferencia BCP'].income,
        'Plin/Transferencia INTERBANK': summary['Plin/Transferencia INTERBANK'].income,
        POS: summary.POS.income,
      },
      {
        type: 'Egreso',
        Efectivo: summary.Efectivo.expense,
        'Yape/Transferencia BCP': summary['Yape/Transferencia BCP'].expense,
        'Plin/Transferencia INTERBANK': summary['Plin/Transferencia INTERBANK'].expense,
        POS: summary.POS.expense,
      },
      {
        type: 'Saldo',
        Efectivo: summary.Efectivo.balance,
        'Yape/Transferencia BCP': summary['Yape/Transferencia BCP'].balance,
        'Plin/Transferencia INTERBANK': summary['Plin/Transferencia INTERBANK'].balance,
        POS: summary.POS.balance,
      },
      {
        type: 'IngresoCaja',
        POS: summary.totalCashIncome,
      },
      {
        type: 'EgresoCaja',
        POS: summary.totalCashExpense,
      },
      {
        type: 'TotalCaja',
        POS: summary.totalCashBalance,
      },
    ];
  }

  isPaymentMethodRow = (row: any) => row.type === 'Ingreso' || row.type === 'Egreso' || row.type === 'Saldo';
  isTotalRow = (row: any) => row.type === 'IngresoCaja' || row.type === 'EgresoCaja' || row.type === 'TotalCaja';

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
    this.cashManagementService.generatePdf(id).subscribe({
      next: (response) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `movimiento_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.snackBar.open('PDF generado exitosamente', 'Cerrar', {
          duration: 3000,
        });
      },
      error: (error) => {
        this.snackBar.open('Error al generar PDF: ' + error.message, 'Cerrar', {
          duration: 3000,
        });
        console.error('Error generating PDF:', error);
      },
    });
  }
}
