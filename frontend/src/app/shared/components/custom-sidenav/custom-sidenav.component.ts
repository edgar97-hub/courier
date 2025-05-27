import {
  Component,
  computed,
  inject,
  Input,
  input,
  OnInit,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { MenuItem, menuItems } from './menu-items';
import { AppStore } from '../../../app.store';
import { SettingsService } from '../../../features/settings/services/settings.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-custom-sidenav',
  template: `
    <mat-nav-list class="[--mat-list-active-indicator-shape:0px] mb-6">
      <a
        mat-list-item
        [href]="enlace"
        target="_blank"
        rel="noopener noreferrer"
        [style.--mat-list-list-item-leading-icon-start-space]=""
        matRipple
        class="menu-link-item"
      >
        <mat-icon matListItemIcon>map</mat-icon>
        <span matListItemTitle>Mapa de cobertura</span>
      </a>

      @for (item of filteredMenuItems(); track item.label) {
      <app-menu-item [item]="item" [isSidenavOpen]="isSidenavOpen" />
      }
    </mat-nav-list>
  `,
  styles: [``],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
    MatIconModule,
    MenuItemComponent,
  ],
})
export class CustomSidenavComponent implements OnInit {
  @Input() isSidenavOpen = false;
  appStore = inject(AppStore);
  private settingsService = inject(SettingsService);
  private destroy$ = new Subject<void>();
  enlace: string | null = null;

  ngOnInit(): void {
    this.settingsService
      .loadSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (loadedSettings: any) => {
          if (loadedSettings.length) {
            this.enlace = loadedSettings[0].coverage_map_url;
          }
        },
        error: (err) => {
          console.log('err', err);
        },
      });
  }

  filteredMenuItems: Signal<MenuItem[]> = computed(() => {
    const currentUser = this.appStore.currentUser();
    const userRole = currentUser?.rol;
    if (!currentUser || !userRole) {
      return menuItems.filter((item) => !item.roles || item.roles.length === 0);
    }

    return menuItems
      .filter((item) => {
        if (!item.roles || item.roles.length === 0) {
          return true;
        }
        return item.roles.includes(userRole);
      })
      .map((item) => {
        if (item.subItems && item.subItems.length > 0) {
          return {
            ...item,
            children: item.subItems.filter((child) => {
              if (!child.roles || child.roles.length === 0) {
                return true;
              }
              return child.roles.includes(userRole);
            }),
          };
        }
        return item;
      });
  });
}
