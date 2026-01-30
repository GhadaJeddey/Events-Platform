import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { toSignal } from '@angular/core/rxjs-interop';
import { AdminService } from '../../services/admin.service';
import { RouterLink } from '@angular/router';

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
  imports: [CommonModule, MatTableModule, DatePipe, RouterLink],
  templateUrl: './room-approval.html',
  styleUrls: ['./room-approval.css']
})
export class RoomApproval {
  private adminService = inject(AdminService);
  private toastr = inject(ToastrService);

  displayedColumns: string[] = [
    'room',
    'organizer',
    'eventTitle',
    'startDate',
    'endDate',
    'actions'
  ];

  pendingRequests = toSignal(this.adminService.getPendingRoomReservations(), { 
    initialValue: [] as RoomReservationRequest[] 
  });

  constructor() {
    // Debug: log les données reçues
    this.adminService.getPendingRoomReservations().subscribe(data => {
      console.log('Pending room reservations:', data);
    });
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
}
