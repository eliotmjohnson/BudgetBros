import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: '[fieldError]',
  templateUrl: './field-error.component.html',
  styleUrl: './field-error.component.scss'
})
export class FieldErrorComponent {
  form = input.required<FormGroup>();
  fieldName = input.required<string>();
  errorMsg = input<string>();
}
