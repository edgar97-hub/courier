// import {
//   Component,
//   computed,
//   inject,
//   Input,
//   input,
//   OnInit,
//   Signal,
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatListModule } from '@angular/material/list';
// import { RouterModule } from '@angular/router';
// import { MatIconModule } from '@angular/material/icon';
// import { MenuItemComponent } from './menu-item/menu-item.component';
// import { MenuItem, menuItems } from './menu-items';
// import { AppStore } from '../../../app.store';
// import { SettingsService } from '../../../features/settings/services/settings.service';
// import { Subject, takeUntil } from 'rxjs';

// @Component({
//   selector: 'app-custom-sidenav',
//   template: `
//     <mat-nav-list class="[--mat-list-active-indicator-shape:0px] mb-6">
//       <a
//         mat-list-item
//         [href]="enlace"
//         target="_blank"
//         rel="noopener noreferrer"
//         [style.--mat-list-list-item-leading-icon-start-space]=""
//         matRipple
//         class="menu-link-item"
//       >
//         <mat-icon matListItemIcon>map</mat-icon>
//         <span matListItemTitle>Mapa de cobertura</span>
//       </a>

//       @for (item of filteredMenuItems(); track item.label) {
//       <app-menu-item [item]="item" [isSidenavOpen]="isSidenavOpen" />
//       }
//     </mat-nav-list>
//   `,
//   styles: [``],
//   imports: [
//     CommonModule,
//     MatSidenavModule,
//     MatListModule,
//     RouterModule,
//     MatIconModule,
//     MenuItemComponent,
//   ],
// })
// export class CustomSidenavComponent implements OnInit {
//   @Input() isSidenavOpen = false;
//   appStore = inject(AppStore);
//   private settingsService = inject(SettingsService);
//   private destroy$ = new Subject<void>();
//   enlace: string | null = null;

//   ngOnInit(): void {
//     this.settingsService
//       .loadSettings()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (loadedSettings: any) => {
//           if (loadedSettings.length) {
//             this.enlace = loadedSettings[0].coverage_map_url;
//           }
//         },
//         error: (err) => {
//           console.log('err', err);
//         },
//       });
//   }

//   filteredMenuItems: Signal<MenuItem[]> = computed(() => {
//     const currentUser = this.appStore.currentUser();
//     const userRole = currentUser?.rol;
//     if (!currentUser || !userRole) {
//       return menuItems.filter((item) => !item.roles || item.roles.length === 0);
//     }

//     return menuItems
//       .filter((item) => {
//         if (!item.roles || item.roles.length === 0) {
//           return true;
//         }
//         return item.roles.includes(userRole);
//       })
//       .map((item) => {
//         if (item.subItems && item.subItems.length > 0) {
//           return {
//             ...item,
//             children: item.subItems.filter((child) => {
//               if (!child.roles || child.roles.length === 0) {
//                 return true;
//               }
//               return child.roles.includes(userRole);
//             }),
//           };
//         }
//         return item;
//       });
//   });
// }

import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  OnDestroy,
  Signal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core'; // Para matRipple

import { MenuItemComponent } from './menu-item/menu-item.component';
import { MenuItem, menuItems as baseMenuItems } from './menu-items'; // Renombrar para claridad
import { AppStore } from '../../../app.store';
import { SettingsService } from '../../../features/settings/services/settings.service'; // Ajusta ruta
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import SidenavHeaderComponent from './sidenav-header/sidenav-header.component';

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  template: `
    <app-sidenav-header [collapsed]="collapsed()" />

    <mat-nav-list class="app-nav-list" [class.collapsed]="collapsed()">
      @if (coverageMapLinkSignal(); as mapLink) {
      <a
        mat-list-item
        [href]="mapLink"
        target="_blank"
        rel="noopener noreferrer"
        matRipple
        class="menu-link-item static-link"
      >
        <mat-icon matListItemIcon class="menu-item-icon">map</mat-icon>
        <span matListItemTitle>Mapa de cobertura</span>
      </a>
      } @for (item of filteredMenuItems(); track item.label) {
      <app-menu-item [item]="item" [collapsed]="collapsed()" [level]="0" />
      } @empty { @if (!coverageMapLinkSignal()) {
      <mat-list-item disabled>
        <div matListItemTitle>No hay opciones de menú.</div>
      </mat-list-item>
      } }
    </mat-nav-list>
  `,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
    MatIconModule,
    MenuItemComponent,
    MatRippleModule, // Añadido para matRipple
    SidenavHeaderComponent,
  ],
})
export class CustomSidenavComponent implements OnInit, OnDestroy {
  collapsed = input<boolean>(false);

  appStore = inject(AppStore);
  private settingsService = inject(SettingsService);
  private destroy$ = new Subject<void>();

  coverageMapLinkSignal = signal<string | null>(null);

  ngOnInit(): void {
    this.settingsService
      .loadSettings() // Asume que este método devuelve un Observable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (loadedSettings: any) => {
          if (
            loadedSettings &&
            loadedSettings.length > 0 &&
            loadedSettings[0].coverage_map_url
          ) {
            this.coverageMapLinkSignal.set(loadedSettings[0].coverage_map_url);
          } else {
            console.warn(
              'CustomSidenav: Coverage map URL not found in settings.'
            );
            this.coverageMapLinkSignal.set(null); // O un enlace de fallback
          }
        },
        error: (err) => {
          console.error(
            'CustomSidenav: Error loading settings for coverage map link:',
            err
          );
          this.coverageMapLinkSignal.set(null); // O un enlace de fallback
        },
      });
  }

  filteredMenuItems: Signal<MenuItem[]> = computed(() => {
    const allItems = baseMenuItems; // Tus ítems de menú definidos estáticamente
    const currentUser = this.appStore.currentUser();
    const userRole = currentUser?.role;
    const isAuthenticated = this.appStore.isAuthenticated();

    return allItems
      .filter((item) => {
        if (!isAuthenticated) return false;
        if (!item.roles || item.roles.length === 0) return true;
        return userRole && item.roles.includes(userRole);
      })
      .map((item) =>
        this.filterSubItemsRecursively(item, userRole, isAuthenticated)
      );
  });

  private filterSubItemsRecursively(
    item: MenuItem,
    userRole: string | null | undefined,
    isAuthenticated: boolean
  ): MenuItem {
    if (item.subItems && item.subItems.length > 0) {
      const visibleSubItems = item.subItems
        .filter((child) => {
          if (!isAuthenticated) return false;
          if (!child.roles || child.roles.length === 0) return true;
          return userRole && child.roles.includes(userRole);
        })
        .map((child) =>
          this.filterSubItemsRecursively(child, userRole, isAuthenticated)
        );

      return { ...item, subItems: visibleSubItems };
    }
    return { ...item };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
