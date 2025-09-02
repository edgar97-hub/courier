import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
// MatSnackBarModule ya no es estrictamente necesario aquí si los Effects lo manejan
// import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap, filter } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as UserActions from '../../store/user.actions';
import * as UserSelectors from '../../store/user.selectors';

import { UserFormComponent } from '../../components/user-form/user-form.component';
import { User } from '../../models/user.model'; // Tu modelo User

@Component({
  selector: 'app-user-create-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserFormComponent,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './user-create-page.component.html',
  styleUrls: ['./user-create-page.component.scss'],
})
export class UserCreatePageComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);

  isSubmitting$: Observable<boolean>;
  error$: Observable<string | null>;

  private destroy$ = new Subject<void>();

  constructor() {
    this.isSubmitting$ = this.store.select(
      UserSelectors.selectUserIsSubmitting
    );
    this.error$ = this.store.select(UserSelectors.selectUserError);
  }

  ngOnInit(): void {
    // Limpiar cualquier error previo del store de usuarios al entrar a esta página
    this.store.dispatch(UserActions.clearUserError());

    // Opcional: si quieres que el COMPONENTE muestre el snackbar de error en lugar del Effect
    // this.error$.pipe(
    //   takeUntil(this.destroy$),
    //   filter(error => !!error), // Solo si hay un error
    //   tap(error => {
    //     this.snackBar.open(`Creation Failed: ${error}`, 'Close', {
    //       duration: 5000,
    //       panelClass: ['error-snackbar']
    //     });
    //     this.store.dispatch(UserActions.clearUserError()); // Limpiar después de mostrar
    //   })
    // ).subscribe();
  }

  handleFormSubmit(userData: Omit<User, 'id'>): void {
    // El UserFormComponent emite Omit<User, 'id'>
    console.log('UserCreatePageComponent: Form submitted', userData);
    this.store.dispatch(UserActions.createUser({ user: userData }));
    // La navegación y el snackbar de éxito son manejados por el UserEffects.createUserSuccess$
  }

  handleFormCancel(): void {
    this.router.navigate(['/users']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
