import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
})
export class CustomInputComponent {
  @Input() label!: string;
  @Input() label_s!: string;
  @Input() control!: FormControl<any>;
  @Input() errorMessage!: string;
  @Input() type: 'text' | 'date' | 'email' | 'password' | 'select' = 'text';
  @Input() options: { value: string; label: string }[] = [];

  passwordVisible: boolean = false;

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  getInputType(): string {
    if (this.type === 'password' && !this.passwordVisible) return 'password';
    return this.type;
  }
}
