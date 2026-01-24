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
  

  logout(): void {
    this.authService.logout();
  }

  getProfilePath(): string {
    const user = this.authService.currentUser();
    if (!user) return ''; 

    switch (user.role) {
      case UserRole.STUDENT:
        return '/student/profile';
      case UserRole.ORGANIZER:
        return '/organizer/profile';
      case UserRole.ADMIN:
        return '/admin/profile';
      default:
        return '';
    }
  }
}
