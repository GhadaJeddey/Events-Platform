import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { MatTableModule } from '@angular/material/table'; 
import { ToastrService } from 'ngx-toastr';
import { toSignal } from '@angular/core/rxjs-interop'; 
import { AdminService } from '../../services/admin.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-approval',
  standalone: true,
  imports: [CommonModule, MatTableModule, RouterLink, FormsModule], 
  templateUrl: './event-approval.html',
  styleUrls: ['./event-approval.css']
})
export class EventApproval {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);
  
  searchTerm = signal('');
  
  displayedColumns: string[] = [
    'title', 
    'description', 
    'location', 
    'startDate', 
    'endDate', 
    'capacity', 
    'actions'
  ];

  allEvents = toSignal(this.adminService.getPendingEvents(), { initialValue: [] });

  pendingEvents = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const events = this.allEvents();
    
    if (!term) return events;
    
    return events.filter(e =>
      e.title.toLowerCase().includes(term) ||
      e.description?.toLowerCase().includes(term) ||
      e.location?.toLowerCase().includes(term)
    );
  });

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