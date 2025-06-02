import { Component, effect, inject, Input, model, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AppStore } from '../../../app.store';
import { MatSidenav } from '@angular/material/sidenav';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { ProfileEditDialogComponent } from '../profile-edit-dialog/profile-edit-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbar,
    MatIcon,
    MatButtonModule,
    MatMenuModule,
    // ThemeToggleComponent,
  ],
  template: `
    <mat-toolbar class="app-header">
      <button mat-icon-button (click)="toggleSidenav()">
        <mat-icon>menu</mat-icon>
      </button>
      <a
        mat-list-item
        [href]="'dashboard'"
        rel="noopener noreferrer"
        matRipple
        class="menu-link-item static-link"
      >
        <img
          src="{{ logoImageUrl }}"
          style="max-width: 100px; border: 0px solid black"
        />
      </a>
      <div class="header-spacer"></div>
      <!-- <app-theme-toggle></app-theme-toggle> -->

      @if (appStore.currentUser(); as user) {
      <button mat-icon-button [mat-menu-trigger-for]="profileMenu">
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #profileMenu="matMenu">
        <button mat-menu-item (click)="openProfileEditDialog()">
          <mat-icon>manage_accounts</mat-icon>
          <span>Editar Perfil</span>
        </button>
        <button mat-menu-item (click)="appStore.logout()">
          <mat-icon>logout</mat-icon>
          Cerrar sesión
        </button>
      </mat-menu>
      }
    </mat-toolbar>
  `,
  styles: `
    .app-header {
      position: relative;
      z-index: 10;
      border: 1px solid #B8B2B2;
      /* mat-elevation-z3 is already handled by Angular Material's default styling for mat-toolbar */
      /* [view-transition-name:header] is an Angular specific attribute, not a Tailwind class, so it remains */
    }

    .header-spacer {
      flex: 1;
    }
  `,
})
export class HeaderComponent {
  appStore = inject(AppStore);
  router = inject(Router);
  logoImageUrl: string = environment.apiUrl + '/settings/company/logo-image';
  @Input() sidenav!: MatSidenav;
  private dialog = inject(MatDialog);

  toggleSidenav() {
    this.sidenav.toggle();
  }
  openProfileEditDialog(): void {
    const currentUser = this.appStore.currentUser();
    this.dialog.open(ProfileEditDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { user: currentUser },
      disableClose: true,
    });
  }
}
