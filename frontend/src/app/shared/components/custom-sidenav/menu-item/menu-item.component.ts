import { Component, computed, Input, input, signal } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { MenuItem } from '../menu-items';
import { CommonModule } from '@angular/common'; // <--- IMPORTANTE: Añadir CommonModule para *ngIf
@Component({
  selector: 'app-menu-item',
  imports: [
    RouterModule,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    CommonModule,
  ],
  template: `
    <a
      *ngIf="isExternalLink()"
      mat-list-item
      [href]="item().externalLink"
      target="_blank"
      rel="noopener noreferrer"
      [style.--mat-list-list-item-leading-icon-start-space]="indentation()"
      matRipple
      class="menu-link-item"
    >
      <mat-icon matListItemIcon>{{ item().icon }}</mat-icon>
      @if(!isSidenavOpen) {
      <span matListItemTitle>{{ item().label }}</span>

      }
    </a>
    <a
      *ngIf="!isExternalLink()"
      mat-list-item
      [style.--mat-list-list-item-leading-icon-start-space]="indentation()"
      [routerLink]="routeHistory() + '/' + item().route"
      (click)="nestedItemOpen.set(!nestedItemOpen())"
      routerLinkActive
      #rla="routerLinkActive"
      [activated]="rla.isActive"
    >
      <mat-icon
        [fontSet]="rla.isActive ? 'material-icons' : 'material-icons-outlined'"
        matListItemIcon
        >{{ item().icon }}</mat-icon
      >
      <span matListItemTitle>{{ item().label }}</span>

      @if(item().subItems) {
      <span matListItemMeta>
        @if(nestedItemOpen()) {
        <mat-icon>expand_less</mat-icon>
        } @else {
        <mat-icon>expand_more</mat-icon>
        }
      </span>
      }
    </a>
    @if (nestedItemOpen() ) {
    <div @expandContractMenu>
      @for(subItem of item().subItems; track subItem.route) {
      <app-menu-item
        [item]="subItem"
        [routeHistory]="routeHistory() + '/' + item().route"
        [isSidenavOpen]="isSidenavOpen"
      />
      }
    </div>
    }
  `,
  styles: `
    :host * {
      transition-property: margin-inline-start, opacity, height;
      transition-duration: 500ms;
      transition-timing-function: ease-in-out;
    }
  `,
  animations: [
    trigger('expandContractMenu', [
      transition(':enter', [
        style({ opacity: 0, height: '0px' }),
        animate('500ms ease-in-out', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({ opacity: 0, height: '0px' })),
      ]),
    ]),
  ],
})
export class MenuItemComponent {
  item = input.required<MenuItem>();
  @Input() isSidenavOpen = false;

  routeHistory = input('');

  level = computed(() => this.routeHistory().split('/').length - 1);
  indentation = computed(() => {
    return this.isSidenavOpen ? '26px' : `${16 + this.level() * 16}px`;
  });

  isExternalLink(): boolean {
    return !!this.item().externalLink;
  }

  nestedItemOpen = signal(false);
}
