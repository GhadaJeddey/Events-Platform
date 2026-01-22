import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../Models/auth.models';

import { ButtonComponent } from '../../shared/components/button/button';
import { InputComponent } from '../../shared/components/input/input';
import { CardComponent } from '../../shared/components/card/card';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent, CardComponent],
    templateUrl: './register.html',
    styleUrl: './register.css'
})
export class RegisterComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastr = inject(ToastrService);

    registerForm: FormGroup;
    isLoading = signal(false);
    roles = [
        { value: UserRole.STUDENT, label: 'Étudiant' },
        { value: UserRole.ORGANIZER, label: 'Organisateur' },
        { value: UserRole.ADMIN, label: 'Administrateur' }
    ];

    constructor() {
        this.registerForm = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
            role: [UserRole.STUDENT, [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { passwordMismatch: true };
        }
        return null;
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            this.isLoading.set(true);
            const { confirmPassword, ...registerData } = this.registerForm.value;

            this.authService.register(registerData).subscribe({
                next: () => {
                    this.toastr.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                    this.router.navigate(['/auth/login']);
                    this.isLoading.set(false);
                },
                error: (err) => {
                    this.toastr.error(err.error?.message || "Erreur lors de l'inscription");
                    this.isLoading.set(false);
                }
            });
        } else {
            this.registerForm.markAllAsTouched();
        }
    }
}
