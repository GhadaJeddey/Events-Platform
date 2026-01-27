import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional guard to restrict access to ADMIN users only
 */
export const adminGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // First check if logged in, then check if admin
    if (authService.isAuthenticated() && authService.isAdmin()) {
        return true;
    }

    // If not admin, redirect to events list (or a forbidden page)
    // We could also show a toast message here
    console.warn('Access denied: Admin privileges required.');
    router.navigate(['/events']);
    return false;
};
