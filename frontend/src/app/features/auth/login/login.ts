import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../../shared/models/auth.models';

import { ButtonComponent } from '../../../shared/components/button/button';
import { InputComponent } from '../../../shared/components/input/input';
import { CardComponent } from '../../../shared/components/card/card';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent, CardComponent],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastr = inject(ToastrService);

    loginForm: FormGroup;
    isLoading = signal(false);

    constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.isLoading.set(true);
            this.authService.login(this.loginForm.value).subscribe({
                next: () => {
                    this.toastr.success('Connexion réussie !');
                    // Get current user from AuthService
                    const user = this.authService.currentUser();
                    if (user) {
                        // Redirect based on role
                        switch (user.role) {
                            case UserRole.STUDENT:
                                this.router.navigate(['/student/dashboard']);
                                break;
                            case UserRole.ORGANIZER:
                                this.router.navigate(['/organizer/dashboard']);
                                break;
                            case UserRole.ADMIN:
                                this.router.navigate(['/admin/dashboard']);
                                break;
                        }
                    }
                    this.isLoading.set(false);
                },
                error: (err) => {
                    const message = err.error?.message || 'Identifiants invalides';
                    if (typeof message === 'string' && message.toLowerCase().includes('validation')) {
                        this.toastr.warning(message);
                    } else {
                        this.toastr.error(message);
                    }
                    this.isLoading.set(false);
                }
            });
        } else {
            this.loginForm.markAllAsTouched();
        }
    }
}
