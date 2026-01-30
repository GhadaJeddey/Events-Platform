import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminService } from '../../services/admin.service';
import { Organizer } from '../../Models/organizer';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-organizer-approval',
  standalone: true,
  imports: [CommonModule, MatTableModule, DatePipe, RouterLink],
  templateUrl: './organizer-approval.html',
  styleUrls: ['./organizer-approval.css']
})
export class OrganizerApproval {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  displayedColumns: string[] = [
    'name',
    'president',
    'email',
    'website',
    'createdAt',
    'actions'
  ];

  pendingOrganizers = toSignal(this.adminService.getPendingOrganizers(), { initialValue: [] as Organizer[] });

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
