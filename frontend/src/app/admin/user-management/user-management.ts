import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../../services/admin.service';
import { UserRole, User } from '../../Models/auth.models';
import { catchError, of } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSelectModule, MatFormFieldModule, FormsModule, RouterLink],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  roles = [UserRole.STUDENT, UserRole.ORGANIZER, UserRole.ADMIN];
  displayedColumns: string[] = ['email', 'firstName', 'lastName', 'role'];

  searchTerm = signal('');

  users = toSignal(
    this.adminService.getAllUsers().pipe(
      catchError(err => {
        this.toastr.error('Erreur chargement users');
        return of([]);
      })
    ),
    { initialValue: [] }
  );

filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allUsers = this.users();

    if (!term) return allUsers;

    return allUsers.filter(u =>
      u.email.toLowerCase().includes(term) ||
      (u.firstName || '').toLowerCase().includes(term) || // 👈 Fixed: defaults to empty string
      (u.lastName || '').toLowerCase().includes(term) ||  // 👈 Fixed: defaults to empty string
      u.role.toLowerCase().includes(term)
    );
  });

  updateRole(user: User, newRole: UserRole) {
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: () => this.toastr.success('Role updated successfully'),
      error: () => this.toastr.error('Error updating role')
    });
  }
}
