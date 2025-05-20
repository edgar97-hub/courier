import { Directive, ElementRef, inject, input } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Directive({
  selector: '[appFieldError]',
  standalone: true,
})
export class FieldErrorDirective {
  private formField = inject(MatFormField);
  private element = inject(ElementRef);

  customMessage = input<string>('');

  ngAfterViewInit() {
    const control = this.formField._formFieldControl.ngControl?.control;

    if (!control) {
      throw new Error(
        'FieldErrorDirective must be used with a form control within a mat-form-field'
      );
    }

    // Subscribe to status changes to update error message
    control.events.pipe(untilDestroyed(this)).subscribe(() => {
      if (control?.errors && (control.dirty || control.touched)) {
        const firstError = Object.keys(control.errors)[0];
        this.element.nativeElement.textContent = this.getErrorMessage(
          firstError,
          control.errors[firstError]
        );
      } else {
        this.element.nativeElement.textContent = '';
      }
    });
  }

  private getErrorMessage(errorKey: string, errorValue: any): string {
    // Default error messages
    const errorMessages: { [key: string]: string | ((error: any) => string) } =
      {
        required: 'Este campo es obligatorio',
        email:
          'Por favor, introduce una dirección de correo electrónico válida',
        min: (error) => `El valor debe ser mayor o igual a ${error.min}`,
        max: (error) => `El valor debe ser menor o igual a ${error.max}`,
        minlength: (error) =>
          `debe ser al menos ${error.requiredLength} characters`,
        maxlength: (error) =>
          `No puede ser más que ${error.requiredLength} characters`,
        pattern: 'Por favor, introduzca un valor válido',
      };

    const errorMessage = errorMessages[errorKey];
    if (typeof errorMessage === 'function') {
      return errorMessage(errorValue);
    }
    return errorMessage || 'Invalid value';
  }
}
