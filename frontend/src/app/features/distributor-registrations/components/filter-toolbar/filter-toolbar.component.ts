import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-filter-toolbar',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div
      class="filter-containers"
    >
      <mat-form-field
        appearance="outline"
        class="search-fields"
      >
        <mat-label>Buscar...</mat-label>
        <input
          matInput
          [formControl]="searchControl"
          placeholder="Buscar por cliente, DNI, destino..."
        />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </div>
  `,
})
export class FilterToolbarComponent implements OnInit, OnDestroy {
  @Output() searchChanged = new EventEmitter<string>();
  searchControl = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(), // <-- Es buena práctica mantenerlo para evitar emisiones duplicadas
        takeUntil(this.destroy$) // <-- Se desuscribe automáticamente cuando el componente se destruye
      )
      .subscribe((value) => {
        console.log('FilterToolbar: Search term changed to ->', value); // <-- AÑADE ESTE LOG PARA DEPURAR
        this.searchChanged.emit(value || '');
      });
  }

  ngOnDestroy(): void {
    // Cuando el componente se destruye, completamos el Subject.
    this.destroy$.next();
    this.destroy$.complete();
  }
}
