import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RegisterRequest, UserRole } from '../../Models/auth.models';

import { ButtonComponent } from '../../shared/components/button/button';
import { InputComponent } from '../../shared/components/input/input';
import { CardComponent } from '../../shared/components/card/card';
import { toSignal } from '@angular/core/rxjs-interop';
import { computed } from '@angular/core';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent, CardComponent],
    templateUrl: './register.html',
    styleUrl: './register.css'
})
export class RegisterComponent {
    UserRole = UserRole;
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastr = inject(ToastrService);

    // 
    registerForm = this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        role: [UserRole.STUDENT, [Validators.required]],
        // Student specific
        major: [''],
        studentCardNumber: [''],
        // Organizer specific
        name: [''],
        description: [''],
        website: ['']
    }, { validators: (control: AbstractControl) => this.passwordMatchValidator(control) });

    isLoading = signal(false);

    roleSignal = toSignal(this.registerForm.get('role')!.valueChanges, {
        initialValue: this.registerForm.get('role')!.value as UserRole
    });

    // Computed signals for conditional rendering
    isStudent = computed(() => this.roleSignal() === UserRole.STUDENT);
    isOrganizer = computed(() => this.roleSignal() === UserRole.ORGANIZER);

    roles = [
        { value: UserRole.STUDENT, label: 'Étudiant' },
        { value: UserRole.ORGANIZER, label: 'Organisateur' }
    ];

    fieldLabels = computed(() => {
        const role = this.roleSignal();
        if (role === UserRole.ORGANIZER) {
            return {
                firstName: 'Prénom du président courant',
                lastName: 'Nom du président courant',
                email: 'Adresse email du club'
            };
        }
        return {
            firstName: 'Prénom',
            lastName: 'Nom',
            email: 'Adresse email'
        };
    });

    constructor() {
        // Apply initial validators based on default role and listen for changes
        this.updateRoleValidators(this.registerForm.get('role')!.value as UserRole);

        this.registerForm.get('role')!.valueChanges.subscribe((role) => {
            this.updateRoleValidators(role as UserRole);
        });
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
            const formValue = this.registerForm.getRawValue();

            const request: RegisterRequest = {
                role: formValue.role as UserRole,
                user: {
                    email: formValue.email!,
                    password: formValue.password!,
                    firstName: formValue.firstName!,
                    lastName: formValue.lastName!,
                    role: formValue.role as UserRole,
                }
            };

            if (formValue.role === UserRole.STUDENT) {
                request.studentProfile = {
                    major: formValue.major!,
                    studentCardNumber: formValue.studentCardNumber!
                };
            }

            if (formValue.role === UserRole.ORGANIZER) {
                request.organizerProfile = {
                    name: formValue.name!,
                    description: formValue.description || undefined,
                    website: formValue.website || undefined
                };
            }

            this.authService.register(request).subscribe({
                next: () => {
                    if (formValue.role === UserRole.ORGANIZER) {
                        this.toastr.info('Votre compte a été envoyé à l\'administrateur pour validation. Vous serez notifié une fois validé.');
                    } else {
                        this.toastr.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                    }
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

    private updateRoleValidators(role: UserRole): void {
        const majorCtrl = this.registerForm.get('major');
        const studentCardCtrl = this.registerForm.get('studentCardNumber');
        const nameCtrl = this.registerForm.get('name');
        const descriptionCtrl = this.registerForm.get('description');
        const websiteCtrl = this.registerForm.get('website');

        if (!majorCtrl || !studentCardCtrl || !nameCtrl || !descriptionCtrl || !websiteCtrl) return;

        if (role === UserRole.STUDENT) {
            majorCtrl.setValidators([Validators.required]);
            studentCardCtrl.setValidators([Validators.required]);

            nameCtrl.clearValidators();
            descriptionCtrl.clearValidators();
            websiteCtrl.clearValidators();

            nameCtrl.setValue('');
            descriptionCtrl.setValue('');
            websiteCtrl.setValue('');
        } else if (role === UserRole.ORGANIZER) {
            nameCtrl.setValidators([Validators.required]);
            descriptionCtrl.clearValidators();
            websiteCtrl.clearValidators();

            majorCtrl.clearValidators();
            studentCardCtrl.clearValidators();

            majorCtrl.setValue('');
            studentCardCtrl.setValue('');
        } else {
            majorCtrl.clearValidators();
            studentCardCtrl.clearValidators();
            nameCtrl.clearValidators();
            descriptionCtrl.clearValidators();
            websiteCtrl.clearValidators();
        }

        majorCtrl.updateValueAndValidity();
        studentCardCtrl.updateValueAndValidity();
        nameCtrl.updateValueAndValidity();
        descriptionCtrl.updateValueAndValidity();
        websiteCtrl.updateValueAndValidity();
    }
}
