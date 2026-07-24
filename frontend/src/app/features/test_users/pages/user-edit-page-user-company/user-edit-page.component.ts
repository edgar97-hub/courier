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
import { UserFormComponent } from '../../components/user-form-user-company-distribuidor/user-form.component';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { AppStore } from '../../../../app.store';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserFormComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
  ],
  templateUrl: './user-edit-page.component.html',
  styleUrls: ['./user-edit-page.component.scss'],
})
export class UserCompanyEditPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private appStore = inject(AppStore);

  userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  isLoading = true;
  isEditMode = false;
  userId: string | null = null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.isLoading = true;
          this.userSubject.next(null);
        }),
        switchMap((params) => {
          if (this.appStore.currentUser()?.id) {
            this.userId = this.appStore.currentUser()?.id || '';
            return this.userService.getUserById(this.userId);
          }

          this.isLoading = false;
          return of(null);
        }),
        catchError((err) => {
          this.isLoading = false;
          this.snackBar.open('Error fetching user data.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          return of(null);
        }),
        filter((user) => user !== null)
      )
      .subscribe((user) => {
        this.isLoading = false;
        console.log('user', user);
        if (user) {
          this.userSubject.next(user);
        } else if (this.userId) {
          this.snackBar.open(
            `User with ID ${this.userId} not found.`,
            'Close',
            { duration: 3000 }
          );
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
    let userToUpdate: User;
    if (this.userId) {
      userToUpdate = {
        ...updatedUserDataFromForm,
        id: this.userId,
      };
      this.isLoading = true;

      this.userService
        .updateUserCompany(userToUpdate)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (savedUser) => {
            this.isLoading = false;
            this.userSubject.next(savedUser);
            this.snackBar.open(`¡Actualizado exitosamente!`, 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            });
            this.isEditMode = false;
            // window.location.href = '/users';
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.isLoading = false;
            this.snackBar.open(
              'Error al actualizar el usuario. Inténtalo de nuevo.',
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
  }

  handleFormCancel(): void {
    this.isEditMode = false;
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
