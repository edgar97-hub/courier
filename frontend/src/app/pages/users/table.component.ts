import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UserService } from '../../shared/services/user.service';
import { patchState } from '@ngrx/signals';
import { MatIconModule } from '@angular/material/icon';
import { DialogComponent } from './dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../shared/services/auth.service';
import { MatTable } from '@angular/material/table';
import { of, timer } from 'rxjs';
import { delayWhen } from 'rxjs/operators';

export interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-table',
  styleUrl: 'card-footer-example.css',
  imports: [
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatInput,
    MatSortModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
  ],
  template: `
    <mat-card class="example-card " appearance="outlined">
      <mat-card-header>
        <mat-card-title> Configuración / usuarios</mat-card-title>
        <mat-card-subtitle></mat-card-subtitle>
      </mat-card-header>

      <mat-card-content class="flex gap-3 mt-3">
        <button
          class="mb-3 mt-2"
          mat-button
          (click)="openDialog('Add', {})"
          mat-flat-button
        >
          Nuevo Usuario
        </button>
        <mat-form-field>
          <mat-label>Filter</mat-label>
          <input
            matInput
            (keyup)="applyFilter($event)"
            placeholder="Ex. Mia"
            #input
          />
        </mat-form-field>

        <div class="mat-elevation-z8">
          <table mat-table [dataSource]="dataSource" matSort>
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let row">{{ row.id }}</td>
            </ng-container>

            <!-- Progress Column -->
            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
              <td mat-cell *matCellDef="let row">{{ row.username }}</td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Correo</th>
              <td mat-cell *matCellDef="let row">{{ row.email }}</td>
            </ng-container>

            <!-- Fruit Column -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Rol</th>
              <td mat-cell *matCellDef="let row">{{ row.role }}</td>
            </ng-container>

            <!-- Fruit Column -->

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let row">
                <button
                  mat-mini-fab
                  matTooltip="Click to Edit"
                  (click)="openDialog('update', row)"
                >
                  <mat-icon aria-label="Edit">edit</mat-icon>
                </button>
                <button
                  mat-mini-fab
                  matTooltip="Click to Delete"
                  class="iconbutton"
                  color="error"
                >
                  <mat-icon aria-label="Delete" (click)="remove(row.id)"
                    >delete</mat-icon
                  >
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

            <!-- Row shown when there is no matching data. -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="4">
                No data matching the filter "{{ input.value }}"
              </td>
            </tr>
          </table>

          <mat-paginator
            [pageSizeOptions]="[5, 10, 25, 100]"
            aria-label="Select page of users"
          ></mat-paginator>
        </div>
      </mat-card-content>
      <!-- <mat-card-actions>
        <button mat-button>Learn More</button>
      </mat-card-actions> -->
    </mat-card>
  `,
  styles: ``,
})
export default class TableComponent {
  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'actions'];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<UserData>;

  userService = inject(UserService);
  dialog = inject(MatDialog);
  // _changeDetectorRefs: any;

  constructor() {
    this.dataSource = new MatTableDataSource<UserData>();
    // this._changeDetectorRefs = changeDetectorRefs;
    this.getUsers(this.dataSource);
    this.table = this.table;
  }

  async getUsers(dataSource: any) {
    const local = localStorage.getItem('user');
    const user = local ? JSON.parse(local) : null;
    if (!user) {
      return;
    }

    this.userService.getUsers(user).subscribe({
      next: (data) => {
        console.log('data', data);
        dataSource.data = data;
      },
      error: (e) => {
        console.log(e);
      },
    });
  }
  openDialog(action: any, obj: any) {
    obj.action = action;
    this.dialog.open(DialogComponent, {
      data: {
        dialog: this.dialog,
        width: '250px',
        obj: obj,
        getUsers: this.getUsers,
        dataSource: this.dataSource,
      },
    });
  }
  remove(id: string) {
    const local = localStorage.getItem('user');
    const user = local ? JSON.parse(local) : null;
    if (!user) {
      return;
    }

    if (window.confirm('¿Está seguro que desea eliminar este registro?')) {
      this.userService.remove(id, user).subscribe({
        next: (data) => {
          console.log('data', data);
          const myObservable = of('Data received');
          const subscriptionDelay = timer(2000); // Delay subscription by 3 seconds
          myObservable
            .pipe(delayWhen(() => subscriptionDelay))
            .subscribe((data) => {
              console.log(data); // Executes after the 3-second delay
              this.getUsers(this.dataSource);
            });
        },
        error: (e) => {
          console.log(e);
        },
      });
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
