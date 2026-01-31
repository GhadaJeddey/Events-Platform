import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional guard to restrict access to ADMIN users only
 */
export const organizerGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // First check if logged in, then check if admin
    if (authService.isAuthenticated() && authService.isOrganizer()) {
        return true;
    }

    // If not admin, redirect to events list (or a forbidden page)
    // We could also show a toast message here
    router.navigate(['/events']);
    return false;
};
