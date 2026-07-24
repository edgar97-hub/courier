import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap, switchMap } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import * as UserActions from './user.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router'; // Inyectar Router si navegas desde el effect

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router); // Inyectar Router

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      tap(() => console.log('UserEffects: loadUsers action dispatched')),
      exhaustMap(() =>
        this.userService.getUsers().pipe(
          map((users) => {
            console.log('UserEffects: Users received from service', users);
            return UserActions.loadUsersSuccess({ users });
          }),
          catchError((error) => {
            const errorMessage =
              error.message || 'Failed to load users from effect.';
            console.error('UserEffects: Error loading users', error);
            this.snackBar.open(errorMessage, 'Close', {
              duration: 7000,
              panelClass: ['error-snackbar'],
            });
            return of(UserActions.loadUsersFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createUser),
      tap((action) =>
        console.log(
          'UserEffects: createUser action dispatched with user:',
          action.user
        )
      ),
      exhaustMap((action) =>
        this.userService.createUser(action.user).pipe(
          map((createdUser: any) => {
            // Asegúrate de que el tipo sea User
            console.log('UserEffects: User created via service', createdUser);
            return UserActions.createUserSuccess({ user: createdUser });
          }),
          catchError((error) => {
            const errorMessage = error.message || 'Failed to create user.';
            console.error('UserEffects: Error creating user', error);
            // El snackbar de error puede manejarse aquí o en un effect separado
            // this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
            return of(UserActions.createUserFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  createUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.createUserSuccess),
        tap((action) => {
          console.log(
            'UserEffects: createUserSuccess action, navigating for user:',
            action.user
          );
          this.snackBar.open(
            `User "${action.user.username}" created successfully!`,
            'OK',
            {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            }
          );
          this.router.navigate(['/users']);
        })
      ),
    { dispatch: false }
  );
  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),
      switchMap((action) =>
        this.userService.deleteUser(action.userId).pipe(
          // Si es void en éxito, el snackbar y la acción de éxito van aquí
          tap(() => {
            this.snackBar.open('User deleted successfully!', 'OK', {
              duration: 3000,
              panelClass: ['success-snackbar'],
              verticalPosition: 'top',
            });
          }),
          map(() => UserActions.deleteUserSuccess({ userId: action.userId })), // Despacha éxito
          catchError((error) => {
            const errorMessage =
              error.message || 'An unexpected error occurred.';
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar'],
              verticalPosition: 'top',
            });
            return of(UserActions.deleteUserFailure({ error: errorMessage }));
          })
        )
      )
    )
  );
}
