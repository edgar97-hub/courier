import { Component, computed, inject, input } from '@angular/core';
import { AppStore } from '../../../../app.store';

@Component({
  selector: 'app-sidenav-header',
  imports: [],
  template: `
    <div class="sidenav-header-content">
      <img
        class="profile-pic"
        [width]="profilePicSize()"
        [height]="profilePicSize()"
        [src]="
          appStore.currentUser()?.photo_url ||
          'https://previews.123rf.com/images/yupiramos/yupiramos1705/yupiramos170514532/77987159-perfil-del-hombre-joven-icono-de-ilustraci%C3%B3n-vectorial-de-dise%C3%B1o-gr%C3%A1fico.jpg'
        "
      />
      <div class="user-info" [class.collapsed]="collapsed()">
        <h2 class="username">
          {{ appStore.currentUser()?.username ?? 'User' }}
        </h2>
        <p class="user-role">
          {{ appStore.currentUser()?.role?.replace('_', ' y ') }}
        </p>
      </div>
    </div>
  `,
  styles: `
  
  :host * {
    transition-property: width, height, opacity;
    transition-duration: 500ms;
    transition-timing-function: ease-in-out;
  }

  .sidenav-header-content {
    padding-top: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .profile-pic {
    object-fit: cover;
    object-position: center;
    border-radius: 9999px;
    margin-bottom: 0.4rem;
    aspect-ratio: 1 / 1;
  }

  .user-info {
    text-align: center;
    margin-bottom: 0.25rem;
    height: 1.5rem;

    &.collapsed {
      height: 0 !important;
      opacity: 0;
    }
  }

  .username {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
  }

  .user-role {
    font-size: 0.75rem;
    font-weight: 500;
    margin: 0;
  }
  `,
})
export default class SidenavHeaderComponent {
  collapsed = input(false);

  appStore = inject(AppStore);

  profilePicSize = computed(() => (this.collapsed() ? '28' : '56'));
}
