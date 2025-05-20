// src/app/users/pages/user-detail-page/user-detail-page.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { Subject, BehaviorSubject, of } from 'rxjs';
import { switchMap, takeUntil, catchError, tap, filter } from 'rxjs/operators';

import { UserCardComponent } from '../../components/user-card/user-card.component';
import { UserFormComponent } from '../../components/user-form/user-form.component';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserCardComponent,
    UserFormComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
  ],
  templateUrl: './user-detail-page.component.html',
  styleUrls: ['./user-detail-page.component.scss'],
})
export class UserDetailPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable(); // Para pasar al UserCardComponent si no se edita

  isLoading = true;
  isEditMode = false; // Determinará si estamos en modo vista o edición
  userId: string | null = null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.isLoading = true;
          this.userSubject.next(null); // Limpiar usuario anterior
        }),
        switchMap((params) => {
          const idParam = params.get('id');
          if (idParam) {
            this.userId = idParam;
            // Verifica si la URL contiene 'edit' para determinar el modo
            this.isEditMode = this.router.url.includes(`/edit/${this.userId}`);
            return this.userService.getUserById(this.userId);
          }
          this.snackBar.open('User ID not provided in URL.', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/users']);
          return of(null);
        }),
        catchError((err) => {
          this.isLoading = false;
          this.snackBar.open('Error fetching user data.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          this.router.navigate(['/users']);
          return of(null);
        }),
        filter((user) => user !== null) // Solo continuar si el usuario no es null
      )
      .subscribe((user) => {
        this.isLoading = false;
        if (user) {
          this.userSubject.next(user);
        } else if (this.userId) {
          // Si había un ID pero el user es null (no encontrado por el servicio)
          this.snackBar.open(
            `User with ID ${this.userId} not found.`,
            'Close',
            { duration: 3000 }
          );
          this.router.navigate(['/users']);
        }
      });
  }

  navigateToEdit(): void {
    if (this.userId) {
      this.router.navigate(['/users', 'edit', this.userId]);
    }
  }

  navigateToView(): void {
    if (this.userId) {
      this.router.navigate(['/users', this.userId]);
    }
  }

  handleFormSubmit(updatedUserDataFromForm: User): void {
    if (!this.userId) {
      this.snackBar.open('Cannot update user: User ID is missing.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }
    this.isLoading = true;
    const userToUpdate: User = { ...updatedUserDataFromForm, id: this.userId };

    this.userService
      .updateUser(userToUpdate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (savedUser) => {
          this.isLoading = false;
          this.userSubject.next(savedUser); // Actualiza el usuario mostrado si es necesario
          this.snackBar.open(
            `User "${savedUser.username}" updated successfully!`,
            'OK',
            {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            }
          );
          this.isEditMode = false; // Salir del modo edición y mostrar detalles
          this.router.navigate(['/configuracion/users']); // Navegar a la vista de detalles actualizada
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(
            'Error updating user. Please try again.',
            'Retry',
            {
              duration: 5000,
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            }
          );
          console.error('Error updating user:', err);
        },
      });
  }

  handleFormCancel(): void {
    this.isEditMode = false;
    this.router.navigate(['/configuracion/users']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
