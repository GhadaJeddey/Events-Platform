import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

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
            // Simulating API call for now
            setTimeout(() => {
                this.toastr.success('Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.');
                this.emailSent.set(true);
                this.isLoading.set(false);
            }, 1500);
        } else {
            this.forgotForm.markAllAsTouched();
        }
    }
}
