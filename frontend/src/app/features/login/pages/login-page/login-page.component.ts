import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { Credentials } from '../../models/credentials.interface';
import { AppStore } from '../../../../app.store';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoginFormComponent,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  readonly appStore = inject(AppStore);

  constructor(private router: Router) {}

  async onLogin(credentials: Credentials): Promise<void> {
    await this.appStore.login(credentials);
  }
}
