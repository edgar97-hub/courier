import { Component, inject, input, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import { Widget } from '../../dashboard.model';
import { DashboardStore } from '../../dashboard.store';

@Component({
  selector: 'app-widget-options',
  imports: [MatButtonToggleModule, MatIcon, MatButtonModule],
  template: `
    <div
      class="flex gap-2 items-center mb-2"
      [style.view-transition-name]="'widget-width-' + data().id"
    >
      Width
      <mat-button-toggle-group
        name="width"
        [value]="data().columns ?? 1"
        (change)="store.updateWidget(data().id, { columns: +$event.value })"
        hideSingleSelectionIndicator="true"
      >
        <mat-button-toggle [value]="1">1</mat-button-toggle>
        <mat-button-toggle [value]="2">2</mat-button-toggle>
        <mat-button-toggle [value]="3">3</mat-button-toggle>
        <mat-button-toggle [value]="4">4</mat-button-toggle>
      </mat-button-toggle-group>
    </div>
    <div [style.view-transition-name]="'widget-height-' + data().id">
      Height
      <mat-button-toggle-group
        name="height"
        [value]="data().rows ?? 1"
        (change)="store.updateWidget(data().id, { rows: +$event.value })"
        hideSingleSelectionIndicator="true"
      >
        <mat-button-toggle [value]="1">1</mat-button-toggle>
        <mat-button-toggle [value]="2">2</mat-button-toggle>
        <mat-button-toggle [value]="3">3</mat-button-toggle>
        <mat-button-toggle [value]="4">4</mat-button-toggle>
      </mat-button-toggle-group>
    </div>
    <button
      [style.view-transition-name]="'widget-close-' + data().id"
      mat-icon-button
      class="absolute! top-0 right-0"
      (click)="showOptions.set(false)"
    >
      <mat-icon>close</mat-icon>
    </button>
    <button
      [style.view-transition-name]="'widget-delete-' + data().id"
      class="absolute! top-0 left-0 [--mdc-icon-button-icon-color:var(--mat-sys-error)]"
      mat-icon-button
      (click)="store.removeWidget(data().id)"
    >
      <mat-icon>delete</mat-icon>
    </button>
  `,
  styles: `
  
  :host {
    position: absolute;
    z-index: 2;
    background: var(--mat-sys-surface-container);
    color: var(--mat-sys-inverse-surface);
    top: 0;
    left: 0;
    border-radius: inherit;
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    --mat-standard-button-toggle-height: 24px;
  }

  `,
})
export class WidgetOptionsComponent {
  data = input.required<Widget>();
  showOptions = model.required<boolean>();
  store = inject(DashboardStore);
}
