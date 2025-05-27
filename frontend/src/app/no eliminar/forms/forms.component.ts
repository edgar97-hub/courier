import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import {
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
} from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { FieldErrorDirective } from '../../shared/directives/field-error.directive';

@Component({
  selector: 'app-forms',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDividerModule,
    FieldErrorDirective,
  ],
  template: `
    <h2 class="text-2xl mb-4">Forms</h2>
    <div class="mb-6 prose">
      <p class="text-on-surface">
        This section demonstrates clean, responsive form layouts using Angular
        Material components styled with Tailwind CSS. The form below showcases
        proper spacing, alignment, and organization of form fields with a modern
        design that follows Material Design principles.

        <br />
        <br />

        The errors are handled with a custom directive appFieldError that
        automatically detects the validations applied to the form fields and
        adds the error to the mat-error element.
      </p>
    </div>

    <form [formGroup]="userForm" class="mb-6" (ngSubmit)="onSubmit()">
      <div
        class="max-w-3xl p-9 rounded-lg mat-elevation-z3 mb-6 bg-surface-container"
      >
        <h3 class="text-xl font-medium text-on-surface">
          Personal Information
        </h3>
        <p class="text-sm text-on-surface-variant mb-9">
          Please fill in the following information to create your account.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <mat-form-field>
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName" />
            <mat-error appFieldError></mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Middle Name</mat-label>
            <input matInput formControlName="middleName" />
          </mat-form-field>

          <mat-form-field>
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName" />
            <mat-error appFieldError></mat-error>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <mat-form-field>
            <mat-label>Date of Birth</mat-label>
            <input
              matInput
              [matDatepicker]="dobPicker"
              formControlName="dateOfBirth"
            />
            <mat-datepicker-toggle
              matIconSuffix
              [for]="dobPicker"
            ></mat-datepicker-toggle>
            <mat-datepicker #dobPicker></mat-datepicker>
            <mat-error appFieldError></mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Gender</mat-label>
            <mat-select formControlName="gender">
              <mat-option value="male">Male</mat-option>
              <mat-option value="female">Female</mat-option>
              <mat-option value="other">Other</mat-option>
            </mat-select>
            <mat-error appFieldError></mat-error>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <mat-form-field>
            <mat-label>Contact Email</mat-label>
            <input matInput type="email" formControlName="email" />
            <mat-error appFieldError></mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Phone Number</mat-label>
            <input
              matInput
              formControlName="phoneNumber"
              type="tel"
              [maxLength]="10"
            />
            <mat-error appFieldError></mat-error>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 gap-6 mb-6">
          <mat-form-field>
            <mat-label>Preferred Language</mat-label>
            <mat-select formControlName="language">
              <mat-option value="english">English</mat-option>
              <mat-option value="spanish">Spanish</mat-option>
              <mat-option value="french">French</mat-option>
              <mat-option value="german">German</mat-option>
              <mat-option value="chinese">Chinese</mat-option>
              <mat-option value="japanese">Japanese</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div
        class="p-9 rounded-lg mat-elevation-z3 mb-6 bg-surface-container max-w-3xl"
      >
        <h3 class="text-xl font-medium text-on-surface">Address & Location</h3>
        <p class="text-sm text-on-surface-variant mb-9">
          Please specify your address and location.
        </p>

        <div class="grid grid-cols-1 gap-6 mb-6">
          <mat-form-field>
            <mat-label>Street Address</mat-label>
            <input matInput formControlName="streetAddress" />
            <mat-error appFieldError></mat-error>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 gap-6 mb-6">
          <mat-form-field>
            <mat-label>Apartment/Unit Number</mat-label>
            <input matInput formControlName="apartmentUnit" />
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <mat-form-field>
            <mat-label>City</mat-label>
            <input matInput formControlName="city" />
            <mat-error appFieldError></mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>State/Province</mat-label>
            <input matInput formControlName="stateProvince" />
            <mat-error appFieldError></mat-error>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Postal/ZIP Code</mat-label>
            <input matInput formControlName="postalCode" maxlength="5" />
            <mat-error appFieldError></mat-error>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 gap-6 mb-6">
          <mat-form-field>
            <mat-label>Country</mat-label>
            <mat-select formControlName="country">
              <mat-option value="us">United States</mat-option>
              <mat-option value="ca">Canada</mat-option>
              <mat-option value="uk">United Kingdom</mat-option>
              <mat-option value="au">Australia</mat-option>
              <mat-option value="de">Germany</mat-option>
              <mat-option value="fr">France</mat-option>
              <mat-option value="jp">Japan</mat-option>
            </mat-select>
            <mat-error appFieldError></mat-error>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <mat-form-field>
            <mat-label>Time Zone</mat-label>
            <mat-select formControlName="timeZone">
              <mat-option value="utc-8">Pacific Time (UTC-8)</mat-option>
              <mat-option value="utc-7">Mountain Time (UTC-7)</mat-option>
              <mat-option value="utc-6">Central Time (UTC-6)</mat-option>
              <mat-option value="utc-5">Eastern Time (UTC-5)</mat-option>
              <mat-option value="utc-0">Greenwich Mean Time (UTC+0)</mat-option>
              <mat-option value="utc+1"
                >Central European Time (UTC+1)</mat-option
              >
              <mat-option value="utc+8">China Standard Time (UTC+8)</mat-option>
              <mat-option value="utc+9">Japan Standard Time (UTC+9)</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Preferred Currency</mat-label>
            <mat-select formControlName="currency">
              <mat-option value="usd">US Dollar (USD)</mat-option>
              <mat-option value="eur">Euro (EUR)</mat-option>
              <mat-option value="gbp">British Pound (GBP)</mat-option>
              <mat-option value="cad">Canadian Dollar (CAD)</mat-option>
              <mat-option value="aud">Australian Dollar (AUD)</mat-option>
              <mat-option value="jpy">Japanese Yen (JPY)</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div class="flex justify-end gap-4 max-w-3xl">
        <button mat-button type="button">Cancel</button>
        <button mat-flat-button type="submit">Save</button>
      </div>
    </form>
  `,
  styles: ``,
})
export default class FormsComponent {
  fb = inject(NonNullableFormBuilder);

  userForm = this.fb.group({
    // Personal Information
    firstName: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    middleName: [''],
    lastName: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    dateOfBirth: [new Date(), Validators.required],
    gender: ['male', Validators.required],
    email: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required, Validators.minLength(10)]],
    language: ['english'],

    // Address Information
    streetAddress: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
    ],
    apartmentUnit: [''],
    city: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    stateProvince: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    postalCode: ['', [Validators.required, Validators.minLength(5)]],
    country: ['us', Validators.required],
    timeZone: ['utc-5'],
    currency: ['usd'],
  });

  onSubmit() {
    this.userForm.markAllAsTouched();
  }
}
