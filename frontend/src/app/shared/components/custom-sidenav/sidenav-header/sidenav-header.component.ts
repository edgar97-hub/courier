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
        [src]="appStore.currentUser()?.photo_url"
      />
      <div class="user-info" [class.collapsed]="collapsed()">
        <h2 class="username">
          {{ appStore.currentUser()?.username ?? 'User' }}
        </h2>
        <p class="user-role">{{ appStore.currentUser()?.role }}</p>
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
    padding-top: 1rem; /* pt-4 */
    display: flex;
    flex-direction: column; /* flex flex-col */
    align-items: center; /* items-center */
  }

  .profile-pic {
    object-fit: cover; /* object-cover */
    object-position: center; /* object-center */
    border-radius: 9999px; /* rounded-full */
    margin-bottom: 0.75rem; /* mb-3 */
    aspect-ratio: 1 / 1; /* aspect-square */
  }

  .user-info {
    text-align: center; /* text-center */
    margin-bottom: 0.5rem; /* mb-2 */
    height: 2rem; /* h-[2rem] */
    // overflow: hidden; /* To handle height transition */

    
    &.collapsed {
      height: 0 !important; /* h-0! */
      opacity: 0; /* opacity-0 */
    }
  }

  .username {
    font-size: 1.125rem; /* text-lg */
    margin: 0; /* Remove default h2 margin */
    
  }

  .user-role {
    font-size: 0.875rem; /* text-sm */
    margin: 0; /* Remove default p margin */
  }
  `,
})
export default class SidenavHeaderComponent {
  collapsed = input(false);

  appStore = inject(AppStore);

  profilePicSize = computed(() => (this.collapsed() ? '32' : '100'));
}
