import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts'; // Importar NgxChartsModule
import { ChartDataEntry } from '../../services/dashboard-data.service'; // La interfaz que definimos

@Component({
  selector: 'app-status-distribution-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule], // Añadir NgxChartsModule
  templateUrl: './status-distribution-chart.component.html',
  styleUrls: ['./status-distribution-chart.component.scss'],
})
export class StatusDistributionChartComponent implements OnChanges {
  @Input() data: ChartDataEntry[] | null = [];
  @Input() chartTitle: string = 'Distribución por Estado';

  // Opciones de ngx-charts
  view: [number, number] = [600, 350]; // Ancho, Alto del gráfico. Ajusta según necesites.
  gradient: boolean = true;
  showLegend: boolean = true;
  legendPosition: any = 'below'; // 'right' o 'below'
  showLabels: boolean = true;
  isDoughnut: boolean = false; // true para gráfico de dona
  explodeSlices: boolean = false;
  // Colores personalizados para los estados (opcional)
  // Asegúrate de que el orden o los nombres coincidan con tus datos
  colorScheme: Color = {
    name: 'statusColors',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#0d6efd', // Azul (ej. Registrado)
      '#6610f2', // Índigo (ej. En Preparación)
      '#fd7e14', // Naranja (ej. En Tránsito)
      '#198754', // Verde (ej. Entregado)
      '#dc3545', // Rojo (ej. Incidencia)
      '#6c757d', // Gris (ej. Cancelado)
      // Añade más colores si tienes más estados
    ],
  };

  chartData: ChartDataEntry[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      // ngx-charts espera un nuevo array para detectar cambios si los datos se actualizan
      this.chartData = [...this.data];
    }
  }

  onSelect(event: any): void {
    console.log('Chart item selected:', event);
    // Aquí podrías emitir un evento para filtrar una tabla, etc.
  }
}
