import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CustomSidenavComponent } from '../custom-sidenav/custom-sidenav.component';
import { RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule, MatFabButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { AppStore } from '../../../app.store';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-layout',
  imports: [
    HeaderComponent,
    MatSidenavModule,
    CustomSidenavComponent,
    RouterOutlet,
    MatButtonModule,
    MatProgressBar,
    MatListModule,
    MatToolbarModule,
  ],
  template: `
    <div class="example-container" [class.example-is-mobile]="isMobile()">
      <app-header [sidenav]="snav" />

      @if (appStore.isLoading()) {
      <mat-progress-bar
        class="absolute! top-[64px] z-10"
        mode="indeterminate"
      />
      }

      <mat-sidenav-container class="example-sidenav-container">
        <mat-sidenav
          opened
          #snav
          (openedChange)="isSidenavOpen = $event"
          [mode]="isMobile() ? 'over' : 'side'"
          [fixedInViewport]="isMobile()"
          fixedTopGap="56"
          [style.width]="sidenavWidth()"
        >
          <app-custom-sidenav />
        </mat-sidenav>
        <mat-sidenav-content class="content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: `

.example-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.example-is-mobile .example-toolbar {
  position: fixed;
  z-index: 100;
}

h1.example-app-name {
  margin-left: 8px;
}

.example-sidenav-container {
  flex: 1;
}

.example-is-mobile .example-sidenav-container {
  flex: 1 0 auto;
}

  

  `,
})
export default class LayoutComponent implements OnDestroy {
  collapsed = signal(false);
  appStore = inject(AppStore);
  isSidenavOpen = false;
  sidenavWidth = computed(() => (this.isSidenavOpen ? '65px' : '250px'));

  protected readonly isMobile = signal(true);
  private readonly _mobileQuery: MediaQueryList;
  private readonly _mobileQueryListener: () => void;

  constructor() {
    const media = inject(MediaMatcher);

    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () =>
      this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);
  }
  ngOnDestroy(): void {
    this._mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
