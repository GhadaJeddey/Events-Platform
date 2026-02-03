import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './forgot-password.html',
    styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    private toastr = inject(ToastrService);
    private authService = inject(AuthService);
    forgotForm: FormGroup;
    isLoading = signal(false);
    emailSent = signal(false);

    constructor() {
        this.forgotForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit(): void {
        if (this.forgotForm.valid) {
            this.isLoading.set(true);
            const email=this.forgotForm.value.email;
            this.authService.forgotPassword(email).subscribe({
                next: () => {
                    this.toastr.success('Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.');
                    this.emailSent.set(true);
                    this.isLoading.set(false);
                },
                error: (error) => {
                    this.toastr.error(error.error.message);
                    this.isLoading.set(false);
                }
            });
            
            
        } else {
            this.forgotForm.markAllAsTouched();
        }
    }
}
