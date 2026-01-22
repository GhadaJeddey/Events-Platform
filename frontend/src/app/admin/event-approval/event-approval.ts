import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { MatTableModule } from '@angular/material/table'; 
import { ToastrService } from 'ngx-toastr';
import { toSignal } from '@angular/core/rxjs-interop'; 
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-event-approval',
  standalone: true,
  imports: [CommonModule, MatTableModule], 
  templateUrl: './event-approval.html',
  styleUrls: ['./event-approval.css']
})
export class EventApprovalComponent {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);
  
  displayedColumns: string[] = [
    'title', 
    'description', 
    'location', 
    'startDate', 
    'endDate', 
    'capacity', 
    'actions'
  ];

  pendingEvents = toSignal(this.adminService.getPendingEvents(), { initialValue: [] });

  decide(id: string, status: string) {
    this.adminService.updateEventStatus(id, status).subscribe({
      next: () => {
        this.toastr.success(`Event ${status} successfully`);
        window.location.reload(); 
      },
      error: () => this.toastr.error('Action failed')
    });
  }
}