import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsService } from '../../services/events';

import { environment } from '../../../../Commun/environments/environment';
import { InputDatePipe } from '../../../../Commun/pipes/input-date-pipe';
import { ToastrService } from 'ngx-toastr';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, of, tap } from 'rxjs';
import { LoaderComponent } from '../../shared/components/loader/loader';
import { RoomBookingComponent } from '../../shared/components/room-booking/room-booking';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-event',
  imports: [FormsModule, LoaderComponent, RoomBookingComponent, CommonModule],
  templateUrl: './update-event.html',
  styleUrl: './update-event.css',
})
export class UpdateEvent {
  private eventsService = inject(EventsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  eventId: string | null = null;
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  
  // Room booking
  availableRooms = signal<string[]>([]);
  isLoadingRooms = signal(false);
  showRoomBooking = signal(false);
  startDateValue: string = '';
  endDateValue: string = '';
  selectedLocation: string = '';

  currentEvent = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      tap(id => this.eventId = id),
      switchMap(id => {
        if (!id) return of(null);
        return this.eventsService.getEventById(id).pipe(
          tap(event => {
            if (event?.imageUrl) {
              this.imagePreview.set(environment.apiUrl + event.imageUrl);
            }
            if (event) {
              this.selectedLocation = event.location;
              this.startDateValue = typeof event.startDate === 'string' 
                ? event.startDate.slice(0, 16) 
                : new Date(event.startDate).toISOString().slice(0, 16);
              this.endDateValue = typeof event.endDate === 'string' 
                ? event.endDate.slice(0, 16) 
                : new Date(event.endDate).toISOString().slice(0, 16);
            }
          })
        );
      })
    ),
    { initialValue: null }
  );

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(form: NgForm) {
    if (this.eventId) {
      const eventData = {
        ...form.value,
        startDate: this.startDateValue,
        endDate: this.endDateValue,
        location: this.selectedLocation
      };

      this.eventsService.updateEvent(this.eventId, eventData, this.selectedFile()).subscribe({
        next: (response) => {

          this.toastr.success('Événement mis à jour avec succès !');
          this.router.navigate(['/event/details', this.eventId]);
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Erreur lors de la mise à jour de l\'événement';
          this.toastr.error(errorMessage);
        }
      });
    }
  }

  minDate() {
    return new Date().toISOString().slice(0, 16);
  }
  
  return() {
    this.router.navigate(['/organizer/dashboard']);
  }

  onDateChange() {
    if (this.startDateValue && this.endDateValue) {
      this.isLoadingRooms.set(true);
      const start = new Date(this.startDateValue).toISOString();
      const end = new Date(this.endDateValue).toISOString();

      this.eventsService.getAvailableRooms(start, end).subscribe({
        next: (rooms) => {
          this.availableRooms.set(rooms);
          this.isLoadingRooms.set(false);
        },
        error: (err) => {
          console.error('Error fetching available rooms:', err);
          this.availableRooms.set([]);
          this.isLoadingRooms.set(false);
        },
      });
    }
  }

  openRoomBooking() {
    if (!this.startDateValue || !this.endDateValue) {
      this.toastr.info('Veuillez d\'abord sélectionner les dates de début et de fin.');
      return;
    }
    this.showRoomBooking.set(true);
  }

  closeRoomBooking() {
    this.showRoomBooking.set(false);
  }

  onSlotSelected(selection: { date: Date; startTime: string; endTime: string; room: string }) {
    this.selectedLocation = selection.room;
    this.startDateValue = selection.startTime.slice(0, 16);
    this.endDateValue = selection.endTime.slice(0, 16);
    this.showRoomBooking.set(false);
    this.toastr.success(`Salle ${selection.room} réservée pour le créneau sélectionné`);
  }

  getSelectedDate(): Date {
    return this.startDateValue ? new Date(this.startDateValue) : new Date();
  }
}
