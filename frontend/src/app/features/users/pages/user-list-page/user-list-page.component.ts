import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Importar MatDialogModule
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Importar MatSnackBarModule
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap, filter } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import * as UserActions from '../../store/user.actions'; // Asume que tienes estas acciones
import * as UserSelectors from '../../store/user.selectors'; // Asume que tienes estos selectors

import { UserTableComponent } from '../../components/user-table/user-table.component';
import { User } from '../../models/user.model';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserTableComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogModule, // Añadir MatDialogModule
    MatSnackBarModule, // Añadir MatSnackBarModule
  ],
  templateUrl: './user-list-page.component.html',
  styleUrls: ['./user-list-page.component.scss'],
})
export class UserListPageComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  users$: Observable<User[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>; // Para mostrar errores del store si es necesario
  private destroy$ = new Subject<void>();

  constructor() {
    this.users$ = this.store
      .select(UserSelectors.selectAllUsers)
      .pipe(
        tap((users) =>
          console.log('UserListPageComponent: Users from store:', users)
        )
      );
    this.isLoading$ = this.store
      .select(UserSelectors.selectUserIsLoading)
      .pipe(
        tap((isLoading) =>
          console.log('UserListPageComponent: IsLoading from store:', isLoading)
        )
      );
    this.error$ = this.store.select(UserSelectors.selectUserError).pipe(
      filter((error) => !!error), // Solo reaccionar si hay un error
      tap((error) => {
        // Mostrar snackbar de error global si es manejado aquí
        // o preferiblemente en un Effect.
        // Si lo manejas en un Effect, este tap es solo para debug.
        console.error('UserListPageComponent: Error from store:', error);
        // this.snackBar.open(error || 'An unknown error occurred.', 'Close', {
        //   duration: 5000, panelClass: ['error-snackbar'], verticalPosition: 'top'
        // });
      })
    );
  }

  ngOnInit(): void {
    console.log('UserListPageComponent: ngOnInit - dispatching loadUsers');
    this.store.dispatch(UserActions.loadUsers());

    // Escuchar acciones de éxito/fallo de eliminación si quieres manejar snackbars aquí
    // (Aunque es mejor en Effects)
    // this.store.select(UserActions.deleteUserSuccess) // Necesitarías un selector para esto o escuchar acciones
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(() => {
    //     this.snackBar.open('User deleted successfully.', 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
    //   });
  }

  handleViewUser(user: User): void {
    this.router.navigate(['/users', user.id]);
  }

  handleEditUser(user: User): void {
    this.router.navigate(['/configuracion/users', 'edit', user.id]);
  }

  handleDeleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete user "${user.username}" (ID: ${user.id})? This action cannot be undone.`,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((result) => !!result), // Solo continuar si result es true
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.performDelete(user);
      });
  }

  private performDelete(user: User): void {
    this.store.dispatch(UserActions.deleteUser({ userId: user.id || '' }));
  }

  navigateToCreate(): void {
    this.router.navigate(['/configuracion/users/edit/0']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
