import { Component, computed, input, signal, Input } from '@angular/core'; 
import { RouterLinkActive, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MenuItem } from '../menu-items';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatRippleModule,
  ],
  template: `<ng-container *ngIf="item()">
    <a
      mat-list-item
      [style.--mat-list-list-item-leading-icon-start-space]="indentation()"
      [routerLink]="buildRouterLink()"
      (click)="handleClick()"
      [class.active-menu-item]="rla.isActive"
      [class.expanded]="isSubmenuOpen()"
      [class.has-subitems]="hasSubitems()"
      routerLinkActive
      #rla="routerLinkActive"
      [routerLinkActiveOptions]="{ exact: item().route ? true : false }"
      [attr.aria-expanded]="hasSubitems() ? isSubmenuOpen() : null"
      matRipple
      class="menu-item"
    >
      <mat-icon
        matListItemIcon
        class="menu-item-icon"
        [fontSet]="
          rla.isActive && item().route
            ? 'material-icons'
            : 'material-icons-outlined'
        "
      >
        {{ item().icon }}
      </mat-icon>
      @if(!collapsed()) {
      <span matListItemTitle class="menu-item-label">{{ item().label }}</span>
      } @if(hasSubitems() && !collapsed()) {
      <span matListItemMeta class="expand-indicator">
        <mat-icon>{{
          isSubmenuOpen() ? 'expand_less' : 'expand_more'
        }}</mat-icon>
      </span>
      }
    </a>

    @if (hasSubitems() && isSubmenuOpen()) {
    <div
      [@expandContractMenu]="isSubmenuOpen() ? 'expanded' : 'collapsed'"
      class="submenu-container"
    >
      @for(subItem of item().subItems; track subItem.label) {
      <app-menu-item
        [item]="subItem"
        [collapsed]="collapsed()"
        [level]="level() + 1"
        [sidenavInstance]="sidenavInstance()"
        [isMobile]="isMobile()"
      />
      }
    </div>
    }
  </ng-container> `,
  styles: ` 
 :host {
  display: block;
  width: 100%;
}

.menu-item {
  width: 100%;
  border-radius: 0; // O el radio que desees para los ítems
  transition: background-color 0.2s ease-out, color 0.2s ease-out;
  height: 48px; // Altura estándar de MatList item

  .menu-item-icon {
    margin-right: 16px; // Espacio entre icono y texto
    color: inherit; // Hereda color del link
  }

  .menu-item-label {
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
  }

  .expand-indicator mat-icon,
  .external-link-indicator mat-icon {
    font-size: 20px;
    width: 20px;
    height: 20px;
    opacity: 0.7;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.04); // Hover sutil
  }

  &.active-menu-item {
    background-color: rgba(63, 81, 181, 0.1); // Un color de activo sutil
    // color: #3f51b5; // Color primario para el texto e icono activo

    .menu-item-icon, .menu-item-label {
      color: #f97c06; // Color primario
            font-weight: 700;

    }
  }

  // Si el ítem tiene submenús y está expandido, también podría tener un estilo activo
  &.has-subitems.expanded {
    // background-color: rgba(0, 0, 0, 0.03); // Un fondo ligeramente diferente
  }
}

.submenu-container {
  // background-color: rgba(0,0,0,0.02); // Fondo sutil para el contenedor del submenú
  overflow: hidden; // Necesario para la animación
  // Los app-menu-item hijos manejarán su propia indentación basada en [level]
}

// Estilos para el Sidenav colapsado (cuando CustomSidenav pasa collapsed=true)
:host-context(.collapsed) .menu-item { // Si CustomSidenav tiene una clase .collapsed
  .menu-item-label, .expand-indicator, .external-link-indicator {
    display: none; // Ocultar texto e indicadores
  }
  .menu-item-icon {
    margin-right: 0; // Quitar margen si solo se muestra el icono
  }
}`,
  animations: [
    trigger('expandContractMenu', [
      state(
        'collapsed',
        style({ height: '0px', opacity: 0, overflow: 'hidden' })
      ),
      state('expanded', style({ height: '*', opacity: 1 })), // Altura automática
      transition(
        'expanded <=> collapsed',
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class MenuItemComponent {
  isMobile = input.required<boolean>(); // <--- NUEVO INPUT
  sidenavInstance = input<MatSidenav | null>(null);

  item = input.required<MenuItem>();
  routeHistory = input<string>('');
  collapsed = input.required<boolean>();
  level = input<number>(0);

  isSubmenuOpen = signal(false);

  indentation = computed(() => {
    if (this.collapsed()) {
      return `${16 + this.level() * 8}px`; // Indentación mínima incluso colapsado para subítems
    }
    return `${16 + this.level() * 20}px`; // Mayor indentación por nivel cuando está expandido
  });

  hasSubitems(): boolean {
    return !!this.item().subItems && this.item().subItems!.length > 0;
  }

  handleClick(): void {
    const currentItem = this.item();
    if (this.hasSubitems()) {
      this.isSubmenuOpen.set(!this.isSubmenuOpen());
    } else {
      if (currentItem.route) {
        this.closeSidenavOnMobile();
      }
    }

    // || this.isExternalLink()
  }
  private closeSidenavOnMobile(): void {
    if (this.isMobile() && this.sidenavInstance()) {
      this.sidenavInstance()?.close();
    }
  }
  buildRouterLink(): string[] | null {
    const currentItem = this.item();

    const parentRoute = this.routeHistory();
    const currentRouteSegment = currentItem.route!; // Sabemos que existe por la condición anterior

    // Para ítems de primer nivel (level 0), la ruta debe ser absoluta desde la raíz.
    // Para subítems, construimos la ruta relativa al padre.
    if (this.level() === 0) {
      return [
        '/',
        ...currentRouteSegment.split('/').filter((s) => s.length > 0),
      ];
    } else {
      // Si routeHistory ya es una ruta absoluta (ej. /configuracion)
      // y currentRouteSegment es 'orders-delivered', queremos ['/configuracion', 'orders-delivered']
      const segments: string[] = [];
      if (parentRoute) {
        segments.push(...parentRoute.split('/').filter((s) => s.length > 0));
      }
      segments.push(
        ...currentRouteSegment.split('/').filter((s) => s.length > 0)
      );
      return ['/', ...segments]; // Siempre construir rutas absolutas desde la raíz para el menú principal
    }
  }

  getChildRouteHistory(): string {
    const currentItem = this.item();
    const parentRoute = this.routeHistory();

    // Si el ítem actual tiene una ruta, la concatenamos a la historia del padre.
    // Si el ítem actual NO tiene ruta (es solo un agrupador), la historia de sus hijos
    // sigue siendo la misma que la del padre.
    if (currentItem.route) {
      return parentRoute
        ? `${parentRoute}/${currentItem.route}`
        : currentItem.route;
    }
    return parentRoute; // El agrupador no añade a la ruta para sus hijos
  }
}
