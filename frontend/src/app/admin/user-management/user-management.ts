/* import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop'; // <--- LA CLÉ EST ICI
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../../services/admin.service';
import { UserRole, User } from '../../Models/User';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSelectModule, MatFormFieldModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  roles = Object.values(UserRole);
  displayedColumns: string[] = ['email', 'firstName', 'lastName', 'role'];

  users = toSignal(
    this.adminService.getAllUsers().pipe(
      catchError(err => {
        this.toastr.error('Erreur chargement users');
        return of([]); // Retourne un tableau vide en cas d'erreur
      })
    ), 
    { initialValue: [] } 
  );

  updateRole(user: User, newRole: UserRole) {
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: () => this.toastr.success('Role updated successfully'),
      error: () => this.toastr.error('Error updating role')
    });
  }
} */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../../services/admin.service';
import { UserRole, User } from '../../Models/User';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSelectModule, MatFormFieldModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  roles = Object.values(UserRole);
  displayedColumns: string[] = ['email', 'firstName', 'lastName', 'role'];

  // 1. Create a WritableSignal initialized with an empty array 
  //  modify the list later using .set() or .update()
  users = signal<User[]>([]); 

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    // 2. Load data and use .set() to update the signal
    this.adminService.getAllUsers().subscribe({
      next: (u) => this.users.set(u),
      error: () => this.toastr.error('Erreur chargement users')
    });
  }

  updateRole(user: User, newRole: UserRole) {
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        this.toastr.success('Role updated successfully');
        
        // 3. KEY FIX: Use .update() to modify the specific user in the list
        // instantly reflects the change in the UI without re-fetching everything
        this.users.update(currentUsers => 
          currentUsers.map(u => 
            u.id === user.id ? { ...u, role: newRole } : u
          )
        );
      },
      error: () => this.toastr.error('Error updating role')
    });
  }
}