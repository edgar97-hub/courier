import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, filter } from 'rxjs/operators';

// Importaciones de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  template: `
    <div class="date-range-container" [formGroup]="rangeForm">
      <mat-form-field appearance="outline" class="date-field">
        <mat-label>Fecha de inicio</mat-label>
        <input
          matInput
          [matDatepicker]="startPicker"
          formControlName="start"
          placeholder="dd/mm/aaaa"
        />
        <mat-datepicker-toggle
          matIconSuffix
          [for]="startPicker"
        ></mat-datepicker-toggle>
        <mat-datepicker #startPicker></mat-datepicker>
      </mat-form-field>

      <mat-form-field appearance="outline" class="date-field">
        <mat-label>Fecha de fin</mat-label>
        <input
          matInput
          [matDatepicker]="endPicker"
          formControlName="end"
          placeholder="dd/mm/aaaa"
        />
        <mat-datepicker-toggle
          matIconSuffix
          [for]="endPicker"
        ></mat-datepicker-toggle>
        <mat-datepicker #endPicker></mat-datepicker>
      </mat-form-field>
    </div>
  `,
  styles: [
    `
      :host {
        width: 100%;
      }

      .date-range-container {
        display: flex;
        gap: 16px;
        align-items: center;
      }

      .date-field {
        flex: 1;
        min-width: 150px; // Un min-width más flexible para escritorio
      }

      @media (max-width: 768px) {
        .date-range-container {
          flex-direction: column; // Apila los campos de fecha verticalmente
          align-items: stretch; // Estira los campos para que ocupen todo el ancho
          gap: 0; // Opcional: quitar el gap si prefieres que se peguen
        }
      }
    `,
  ],
})
export class DateRangeFilterComponent implements OnInit, OnDestroy {
  @Output() dateRangeChanged = new EventEmitter<DateRange>();

  rangeForm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    const today = new Date();

    this.rangeForm.setValue({
      start: today,
      end: today,
    });
    // ----------------------------------------------

    this.rangeForm.valueChanges
      .pipe(
        debounceTime(400),

        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        const todayStart = value.start
          ? new Date(value.start?.toDateString())
          : today;

        // Fecha de inicio: Hoy a las 00:00:00
        const startOfDay = new Date(
          todayStart.getFullYear(),
          todayStart.getMonth(),
          todayStart.getDate(),
          0,
          0,
          0
        );
        const todayEndOfDay = value.end
          ? new Date(value.end?.toDateString())
          : today;

        // Fecha de fin: Hoy a las 23:59:59
        const endOfDay = new Date(
          todayEndOfDay.getFullYear(),
          todayEndOfDay.getMonth(),
          todayEndOfDay.getDate(),
          23,
          59,
          59
        );
        this.dateRangeChanged.emit({
          start: startOfDay || null,
          end: endOfDay || null,
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
