import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppStore } from './app.store';
import { NgIf } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, MatProgressBarModule],
  template: `
    <mat-progress-bar *ngIf="appStore.isLoading()"></mat-progress-bar>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  appStore = inject(AppStore);
  router = inject(Router);
}
