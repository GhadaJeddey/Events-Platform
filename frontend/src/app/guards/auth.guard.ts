import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional guard to protect routes from unauthorized access
 */
export const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Redirect to login if not authenticated
    // Note: We can add a returnUrl as a query parameter if needed
    router.navigate(['/auth/login']);
    return false;
};
