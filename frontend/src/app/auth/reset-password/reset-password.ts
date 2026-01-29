import { Component, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

import { ButtonComponent } from '../../shared/components/button/button';
import { InputComponent } from '../../shared/components/input/input';
import { CardComponent } from '../../shared/components/card/card';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent, CardComponent],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  resetForm: FormGroup;
  isLoading = signal(false);
  token: string = '';
  showPassword = signal(false);

  constructor() {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.toastr.error('Invalid or missing reset token');
      this.router.navigate(['/auth/login']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.resetForm.valid && this.token) {
      this.isLoading.set(true);
      const newPassword = this.resetForm.get('newPassword')?.value;

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: () => {
          this.toastr.success('Password successfully reset. Please login.');
          this.router.navigate(['/auth/login']);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Failed to reset password');
          this.isLoading.set(false);
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}
