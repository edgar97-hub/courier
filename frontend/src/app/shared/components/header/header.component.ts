import { Component, effect, inject, Input, model, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AppStore } from '../../../app.store';
import { MatSidenav } from '@angular/material/sidenav';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbar,
    MatIcon,
    MatButtonModule,
    MatMenuModule,
    ThemeToggleComponent,
  ],
  template: `
    <mat-toolbar
      class="mat-elevation-z3 relative z-10 [view-transition-name:header]"
    >
      <button mat-icon-button (click)="toggleSidenav()">
        <mat-icon>menu</mat-icon>
      </button>
      <div class="flex-1"></div>
      <!-- <button mat-icon-button (click)="darkMode.set(!darkMode())">

         @if (darkMode()) {
        <mat-icon>light_mode</mat-icon>
        } @else {
        <mat-icon>dark_mode</mat-icon>
        } 
      </button>-->
      <app-theme-toggle></app-theme-toggle>

      @if (appStore.currentUser(); as user) {
      <button mat-icon-button [mat-menu-trigger-for]="profileMenu">
        <!-- <img
          [src]="user.photoUrl"
          class="w-[24px] h-[24px] object-cover rounded-full"
        /> -->
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #profileMenu="matMenu">
        <button mat-menu-item (click)="appStore.logout()">
          <mat-icon>logout</mat-icon>
          Log out
        </button>
      </mat-menu>
      }
    </mat-toolbar>
  `,
  styles: `
  
    mat-toolbar {
        --mat-toolbar-container-background-color: var(--mat-sys-surface-container-low);
    }

  `,
})
export class HeaderComponent {
  appStore = inject(AppStore);
  router = inject(Router);

  @Input() sidenav!: MatSidenav;

  toggleSidenav() {
    this.sidenav.toggle();
  }

  // darkMode = signal(false);
  // setDarkModeClass = effect(() => {
  //   document.documentElement.classList.toggle('dark', this.darkMode());
  // });
}
