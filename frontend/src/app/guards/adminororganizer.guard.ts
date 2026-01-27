import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const adminOrOrganizerGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated() && (authService.isOrganizer() || authService.isAdmin())) {
        return true;
    }
    console.warn('Access denied: Organizer or Admin privileges required.');
    router.navigate(['/events']);
    return false;
};