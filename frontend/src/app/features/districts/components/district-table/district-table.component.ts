import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Para isStandard
import { District } from '../../models/district.model';

@Component({
  selector: 'app-district-table',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
  ],
  templateUrl: './district-table.component.html',
  styleUrls: ['./district-table.component.scss'],
})
export class DistrictTableComponent implements AfterViewInit, OnChanges {
  @Input() districts: District[] | null = [];
  @Input() isLoading: boolean = false;
  @Input() totalCount: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;

  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() sortChanged = new EventEmitter<Sort>();
  @Output() editDistrict = new EventEmitter<District>();
  @Output() deleteDistrict = new EventEmitter<District>();

  displayedColumns: string[] = [
    'code',
    'name',
    'weight_range', // Columna combinada para peso
    'price',
    'isStandard',
    'actions',
  ];
  dataSource: MatTableDataSource<District> = new MatTableDataSource<District>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['districts'] && this.districts) {
      this.dataSource.data = this.districts;
    }
    // No es necesario actualizar el paginador aquí si totalCount, pageSize, pageIndex
    // ya están bindeados en el HTML del paginador.
  }

  ngAfterViewInit(): void {
    // No configurar dataSource.paginator ni dataSource.sort si la paginación/ordenamiento es del lado del servidor.
    // El componente padre manejará la lógica de recargar datos basada en los eventos emitidos.
    if (this.sort) {
      // Emitir el evento de cambio de ordenamiento para que el padre lo maneje
      this.sort.sortChange.subscribe((sortState: Sort) => {
        // Resetear a la primera página cuando cambia el ordenamiento
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        this.sortChanged.emit(sortState);
      });
    }
  }

  onEdit(district: District): void {
    this.editDistrict.emit(district);
  }

  onDelete(district: District): void {
    // La confirmación debería hacerse en el componente padre o un servicio de diálogo
    this.deleteDistrict.emit(district);
  }

  // Para el evento de paginación
  handlePageEvent(event: PageEvent): void {
    this.pageChanged.emit(event);
  }
}
