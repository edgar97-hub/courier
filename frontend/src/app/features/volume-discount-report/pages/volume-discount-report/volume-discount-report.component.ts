import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VolumeDiscountReportService } from '../../services/volume-discount-report.service';
import { OrderService } from '../../../orders/services/order.service';
import { finalize } from 'rxjs';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-volume-discount-report',
  standalone: true,
  providers: [provideNativeDateAdapter(), DatePipe, CurrencyPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './volume-discount-report.component.html',
  styleUrls: ['./volume-discount-report.component.scss'],
})
export class VolumeDiscountReportComponent implements OnInit {
  private reportService = inject(VolumeDiscountReportService);
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);

  filterForm!: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  companies = signal<any[]>([]);
  isLoading = signal(false);

  displayedColumns: string[] = [
    'date',
    'clientName',
    'totalOrders',
    'rangeReached',
    'discount',
    'totalInvoiced',
  ];

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    this.loadCompanies();
    this.fetchReport();
  }

  private initForm() {
    const today = new Date();
    this.filterForm = this.fb.group({
      startDate: [today, Validators.required],
      endDate: [today, Validators.required],
      companyId: [null],
      statusMeta: [null],
    });
  }

  loadCompanies() {
    this.orderService
      .getCompanies('')
      .subscribe((res) => this.companies.set(res));
  }

  fetchReport() {
    if (this.filterForm.invalid) return;
    this.isLoading.set(true);

    const { startDate, endDate, companyId, statusMeta } =
      this.filterForm.getRawValue();

    const params = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      companyId,
      statusMeta,
    };

    this.reportService
      .getReport(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => (this.dataSource.data = data),
        error: () => console.error('Error loading report'),
      });
  }
}
