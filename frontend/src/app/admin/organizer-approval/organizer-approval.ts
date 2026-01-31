import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminService } from '../../services/admin.service';
import { Organizer } from '../../Models/Organizer';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-organizer-approval',
  standalone: true,
  imports: [CommonModule, MatTableModule, DatePipe, RouterLink, FormsModule],
  templateUrl: './organizer-approval.html',
  styleUrls: ['./organizer-approval.css']
})
export class OrganizerApproval {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  searchTerm = signal('');

  displayedColumns: string[] = [
    'name',
    'president',
    'email',
    'website',
    'createdAt',
    'actions'
  ];

  allOrganizers = toSignal(this.adminService.getPendingOrganizers(), { initialValue: [] as Organizer[] });

  pendingOrganizers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const organizers = this.allOrganizers();
    
    if (!term) return organizers;
    
    return organizers.filter(o =>
      o.name?.toLowerCase().includes(term) ||
      o.user?.firstName?.toLowerCase().includes(term) ||
      o.user?.lastName?.toLowerCase().includes(term) ||
      o.user?.email?.toLowerCase().includes(term) ||
      o.website?.toLowerCase().includes(term)
    );
  });

  approve(id: string) {
    this.adminService.updateOrganizerStatus(id, 'APPROVED').subscribe({
      next: () => {
        this.toastr.success('Club approuvé');
        window.location.reload();
      },
      error: () => this.toastr.error('Action échouée')
    });
  }

  reject(id: string) {
    this.adminService.updateOrganizerStatus(id, 'REJECTED').subscribe({
      next: () => {
        this.toastr.success('Club rejeté');
        window.location.reload();
      },
      error: () => this.toastr.error('Action échouée')
    });
  }
}
