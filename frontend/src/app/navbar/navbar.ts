import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { UserRole } from '../Models/auth.models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(AuthService);
  private router = inject(Router);

  isAuthPage(): boolean {
    return this.router.url.startsWith('/auth');
  }

  logout(): void {
    this.authService.logout();
  }

  getProfilePath(): string {
    const user = this.authService.currentUser();
    if (!user) return '';

    switch (user.role) {
      case UserRole.STUDENT:
        return '/profile/student';
      case UserRole.ORGANIZER:
        return '/profile/organizer';
      case UserRole.ADMIN:
        return '/profile/admin';
      default:
        return '';
    }
  }
}
