import { Component, computed, inject, signal } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CustomSidenavComponent } from '../custom-sidenav/custom-sidenav.component';
import { RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule, MatFabButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { AppStore } from '../../../app.store';

@Component({
  selector: 'app-layout',
  imports: [
    HeaderComponent,
    MatIcon,
    MatSidenavModule,
    CustomSidenavComponent,
    RouterOutlet,
    MatButtonModule,
    MatProgressBar,
  ],
  template: `
    <app-header [(collapsed)]="collapsed" />
    @if (appStore.isLoading()) {
    <mat-progress-bar class="absolute! top-[64px] z-10" mode="indeterminate" />
    }
    <mat-sidenav-container>
      <mat-sidenav opened mode="side" [style.width]="sidenavWidth()">
        <app-custom-sidenav [collapsed]="collapsed()" />
      </mat-sidenav>
      <mat-sidenav-content class="content" [style.margin-left]="sidenavWidth()">
        <router-outlet></router-outlet>
        <!-- <a
          mat-fab
          extended
          class="fixed! bottom-5 right-10 [view-transition-name:buy-button]"
          href="https://zoaibkhan.lemonsqueezy.com/buy/4bc3b34d-4980-44be-80bc-bde1dc5b71e9"
          target="_blank"
        >
          <mat-icon>code</mat-icon>Get the code</a
        > -->
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `

  :host {
    position: relative;
  }
  
  .content {
        padding: 24px;
        box-sizing: border-box;
      }

      mat-sidenav-container {
        height: calc(100vh - 64px);
      }

      mat-sidenav-content {
        transition: margin-left 500ms ease-in-out !important;
      }

      mat-sidenav {
        transition: width 500ms ease-in-out !important;
      }

      mat-sidenav {
        --mat-sidenav-container-divider-color: var(--mat-sys-outline-variant);
        --mat-sidenav-container-shape: 0px;
      }

  `,
})
export default class LayoutComponent {
  collapsed = signal(false);
  sidenavWidth = computed(() => (this.collapsed() ? '65px' : '250px'));
  appStore = inject(AppStore);
}
