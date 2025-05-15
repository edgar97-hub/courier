import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
    selector: 'app-content',
    imports: [CommonModule, RouterOutlet, MatTabsModule, RouterModule],
    template: `
    <h2 class="text-2xl mb-4">Browse your content</h2>

    <nav mat-tab-nav-bar [tabPanel]="tabPanel">
      <a
        mat-tab-link
        routerLinkActive
        #rV="routerLinkActive"
        [active]="rV.isActive"
        routerLink="/content/videos"
        >Videos</a
      >
      <a
        mat-tab-link
        routerLinkActive
        #rP="routerLinkActive"
        [active]="rP.isActive"
        routerLink="/content/posts"
        >Posts</a
      >
      <a
        mat-tab-link
        routerLinkActive
        #rG="routerLinkActive"
        [active]="rG.isActive"
        routerLink="/content/gallery"
        >Gallery</a
      >
    </nav>

    <mat-tab-nav-panel #tabPanel>
      <router-outlet />
    </mat-tab-nav-panel>
  `,
    styles: []
})
export default class ContentComponent {}
