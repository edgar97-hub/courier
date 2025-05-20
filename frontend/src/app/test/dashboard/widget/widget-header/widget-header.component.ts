import { Component, inject, input, model } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Widget } from '../../dashboard.model';
import { DashboardStore } from '../../dashboard.store';

@Component({
  selector: 'app-widget-header',
  imports: [MatIcon, MatButtonModule],
  template: `
    <div
      class="flex flex-row justify-between items-center cursor-move mb-3"
      [style.--mdc-icon-button-icon-color]="data().color ?? 'inherit'"
    >
      <h3 class="text-xl">{{ data().label }}</h3>
      @if (store.settings.mode() === 'edit') {
      <div class="absolute top-[20px] right-[20px]">
        <button mat-icon-button (click)="showOptions.set(true)">
          <mat-icon>settings</mat-icon>
        </button>
      </div>
      }
    </div>
  `,
  styles: `
  
  `,
})
export class WidgetHeaderComponent {
  data = input.required<Widget>();
  showOptions = model.required<boolean>();

  store = inject(DashboardStore);
}
