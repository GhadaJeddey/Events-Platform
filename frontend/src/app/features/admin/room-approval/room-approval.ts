import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminService } from '../../../services/admin.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../../../shared/components/loader/loader';
import { SearchComponent } from '../../../shared/components/search/search';
import { tap } from 'rxjs';

interface RoomReservationRequest {
  id: string;
  room: string;
  startDate: string;
  endDate: string;
  eventTitle?: string;
  organizer?: {
    id: string;
    name: string;
    user?: {
      firstName?: string;
      lastName?: string;
    };
  };
  status: string;
}

@Component({
  selector: 'app-room-approval',
  standalone: true,
  imports: [CommonModule, MatTableModule, DatePipe, RouterLink, FormsModule, LoaderComponent, SearchComponent],
  templateUrl: './room-approval.html',
  styleUrls: ['./room-approval.css']
})
export class RoomApproval {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  searchTerm = signal('');
  isLoading = signal(true);

  displayedColumns: string[] = [
    'room',
    'organizer',
    'eventTitle',
    'startDate',
    'endDate',
    'actions'
  ];

  allRequests = toSignal(
    this.adminService.getPendingRoomReservations().pipe(
      tap(() => this.isLoading.set(false))
    ), 
    { initialValue: [] as RoomReservationRequest[] }
  );

  pendingRequests = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const requests = this.allRequests();
    
    if (!term) return requests;
    
    return requests.filter(r =>
      r.room?.toLowerCase().includes(term) ||
      r.organizer?.name?.toLowerCase().includes(term) ||
      r.eventTitle?.toLowerCase().includes(term)
    );
  });

  constructor() {
  }

  approve(id: string) {
    this.adminService.approveRoomReservation(id).subscribe({
      next: () => {
        this.toastr.success('Demande de salle approuvée');
        window.location.reload();
      },
      error: () => this.toastr.error('Action échouée')
    });
  }

  reject(id: string) {
    this.adminService.rejectRoomReservation(id).subscribe({
      next: () => {
        this.toastr.success('Demande de salle rejetée');
        window.location.reload();
      },
      error: () => this.toastr.error('Action échouée')
    });
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
  }
}
