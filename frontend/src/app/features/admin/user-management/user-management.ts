import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../../../services/admin.service';
import { UserRole, User } from '../../../shared/models/auth.models';
import { catchError, of, tap } from 'rxjs';
import { RouterLink } from '@angular/router';
import { LoaderComponent } from '../../../shared/components/loader/loader';
import { SearchComponent } from '../../../shared/components/search/search';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSelectModule, MatFormFieldModule, FormsModule, RouterLink, LoaderComponent, SearchComponent],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  roles = [UserRole.STUDENT, UserRole.ORGANIZER, UserRole.ADMIN];
  displayedColumns: string[] = ['email', 'firstName', 'lastName', 'role'];

  searchTerm = signal('');
  isLoading = signal(true);

  users = toSignal(
    this.adminService.getAllUsers().pipe(
      tap(() => this.isLoading.set(false)),
      catchError(err => {
        this.toastr.error('Erreur chargement users');
        this.isLoading.set(false);
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
      (u.firstName || '').toLowerCase().includes(term) || 
      (u.lastName || '').toLowerCase().includes(term) ||  
      u.role.toLowerCase().includes(term)
    );
  });

  updateRole(user: User, newRole: UserRole) {
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: () => this.toastr.success('Role updated successfully'),
      error: () => this.toastr.error('Error updating role')
    });
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
  }
}
