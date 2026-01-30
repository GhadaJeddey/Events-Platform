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
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-event',
  imports: [FormsModule, LoaderComponent, CommonModule],
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
  startDateValue: string = '';
  endDateValue: string = '';
  selectedLocation: string = '';

  // Vérifier si la salle sélectionnée est disponible pour le créneau
  isRoomAvailable = computed(() => {
    if (!this.selectedLocation || !this.startDateValue || !this.endDateValue) {
      return false;
    }
    return this.availableRooms().includes(this.selectedLocation);
  });

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

  onLocationChange() {
    // Rafraîchir la vérification de disponibilité quand la salle change
    if (this.selectedLocation && this.startDateValue && this.endDateValue) {
      this.onDateChange();
    }
  }

  reserveRoom() {
    if (!this.isRoomAvailable()) {
      this.toastr.warning('Ce créneau n\'est pas disponible pour cette salle.');
      return;
    }
    
    this.toastr.success(`Salle ${this.selectedLocation} réservée pour le créneau sélectionné. Vous pouvez maintenant modifier l'événement.`);
  }
}
