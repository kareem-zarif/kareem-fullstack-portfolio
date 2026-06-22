import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export const contactFormValidators = {
  name: [Validators.required, Validators.minLength(2), Validators.maxLength(80)],
  email: [Validators.required, Validators.email, Validators.maxLength(120)],
  subject: [Validators.required, Validators.minLength(4), Validators.maxLength(120)],
  message: [Validators.required, Validators.minLength(20), Validators.maxLength(2000)],
};

export function noDisposableEmailValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').toLowerCase();
  return value.endsWith('@mailinator.com') ? { disposableEmail: true } : null;
}
