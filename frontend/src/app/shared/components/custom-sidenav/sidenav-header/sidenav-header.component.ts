import { Component, computed, inject, input } from '@angular/core';
import { AppStore } from '../../../../app.store';

@Component({
  selector: 'app-sidenav-header',
  imports: [],
  template: `
    <div class="pt-4 flex flex-col items-center">
      <img
        class="object-cover object-center rounded-full mb-3 aspect-square"
        [width]="profilePicSize()"
        [height]="profilePicSize()"
        [src]="appStore.currentUser()?.photo_url"
      />
      <div
        class="text-center mb-2 h-[2rem] {{
          collapsed() ? 'h-0! opacity-0' : ''
        }}"
      >
        <h2 class="text-lg">
          {{ appStore.currentUser()?.username ?? 'User' }}
        </h2>
        <p class="text-sm">{{ appStore.currentUser()?.role }}</p>
      </div>
    </div>
  `,
  styles: `
  
  :host * {
    transition-property: width, height, opacity;
    transition-duration: 500ms;
    transition-timing-function: ease-in-out;
  }

  `,
})
export default class SidenavHeaderComponent {
  collapsed = input(false);

  appStore = inject(AppStore);

  profilePicSize = computed(() => (this.collapsed() ? '32' : '100'));
}
