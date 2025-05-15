import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppStore } from './app.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
})
export class AppComponent {
  appStore = inject(AppStore);
  router = inject(Router);
}
