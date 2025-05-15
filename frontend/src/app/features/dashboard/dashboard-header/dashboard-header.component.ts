import { Component, effect, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { WidgetsPanelComponent } from '../widgets-panel/widgets-panel.component';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { DashboardStore } from '../dashboard.store';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-dashboard-header',
  imports: [
    MatIcon,
    MatMenuModule,
    MatButtonModule,
    WidgetsPanelComponent,
    CdkDropList,
    CdkDrag,
    MatButtonToggleModule,
  ],
  template: `
    <div
      class="flex flex-row items-center justify-between mb-4 position-relative gap-2"
    >
      <h2 class="text-2xl">Channel Dashboard</h2>
      <div
        class="flex-1 text-sm text-on-surface-variant text-right hidden lg:block"
      >
        Note: For this demo, the dashboard is stored in local storage only to
        avoid conflicts
      </div>
      <mat-button-toggle-group
        [value]="store.settings.mode()"
        (change)="store.setMode($event.value)"
        [hideSingleSelectionIndicator]="true"
      >
        <mat-button-toggle value="view"
          ><mat-icon>visibility</mat-icon></mat-button-toggle
        >
        <mat-button-toggle value="edit"
          ><mat-icon>edit</mat-icon></mat-button-toggle
        >
      </mat-button-toggle-group>
      @if (widgetsOpen()) {
      <app-widgets-panel
        cdkDropList
        cdkDropListOrientation="vertical"
        (cdkDropListDropped)="widgetDroppedInPanel($event)"
        class="mat-elevation-z8"
        cdkDrag
      />
      }
      <button mat-flat-button (click)="widgetsOpen.set(!widgetsOpen())">
        @if(widgetsOpen()) {
        <mat-icon>close</mat-icon>
        } @else {
        <mat-icon>add_circle</mat-icon>
        } Widgets
      </button>
    </div>
  `,
  styles: `
  `,
})
export class DashboardHeaderComponent {
  store = inject(DashboardStore);

  widgetsOpen = signal(false);

  widgetDroppedInPanel(event: CdkDragDrop<number, any>) {
    const { previousContainer } = event;
    this.store.removeWidget(previousContainer.data);
  }
}
