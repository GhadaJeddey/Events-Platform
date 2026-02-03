import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { UserRole } from '../../models/auth.models';
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
  router = inject(Router);

  isAuthPage(): boolean {
    const url = this.router.url;
    return url.includes('/auth/');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getPath(dest : string): string {
    const user = this.authService.currentUser();
    if (!user) return '/events';

    switch (user.role) {
      case UserRole.STUDENT:
        return '/student/' + dest;
      case UserRole.ORGANIZER:
        return '/organizer/' + dest;
      case UserRole.ADMIN:
        return '/admin/' + dest;
      default:
        return '';
    }
  }

}
