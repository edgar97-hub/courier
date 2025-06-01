import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss'],
})
export class KpiCardComponent {
  @Input() title: string = 'KPI Title';
  @Input() value: number | string = 0;
  @Input() icon: string = 'info'; // Ícono de Material
  @Input() colorClass: string = 'default-kpi'; // Para aplicar colores específicos
  @Input() unit: string = ''; // Ej. "pedidos"
}
