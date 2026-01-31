import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { EventsService } from '../../services/events';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-event-form',
  imports: [FormsModule, CommonModule],
  templateUrl: './create-event-form.html',
  styleUrl: './create-event-form.css',
})
export class CreateEventForm {
  private eventsService = inject(EventsService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  minDate = signal<string>(new Date().toISOString().slice(0, 16));

  // Gestion des salles
  availableRooms = signal<string[]>([]);
  isLoadingRooms = signal<boolean>(false);
  roomAvailability = signal<boolean | null>(null);

  startDateValue: string = '';
  endDateValue: string = '';
  selectedLocation: string = '';
  eventTitleValue: string = '';

  // Vérifier si la salle sélectionnée est disponible pour le créneau
  isRoomAvailable = computed(() => {
    const result = {
      selectedLocation: this.selectedLocation,
      startDateValue: this.startDateValue,
      endDateValue: this.endDateValue,
      roomAvailability: this.roomAvailability(),
      availableRooms: this.availableRooms(),
    };

    if (!this.selectedLocation || !this.startDateValue || !this.endDateValue) {
      return false;
    }
    if (this.roomAvailability() === false) {
      return false;
    }
    if (this.roomAvailability() === true) {
      const rooms = this.availableRooms();
      if (rooms.length > 0 && !rooms.includes(this.selectedLocation)) {
        return false;
      }
      return true;
    }
    return false;
  });

  onDateChange() {
    if (this.startDateValue && this.endDateValue) {
      if (this.startDateValue >= this.endDateValue) {
        this.availableRooms.set([]);
        this.roomAvailability.set(false);
        return;
      }

      this.isLoadingRooms.set(true);
      
      this.eventsService.getAvailableRooms(this.startDateValue, this.endDateValue).subscribe({
        next: (rooms) => {
          this.availableRooms.set(rooms);
          this.isLoadingRooms.set(false);
          this.updateRoomAvailability();

          if (rooms.length === 0) {
            this.toastr.info('Aucune salle disponible pour ce créneau.');
          }
        },
        error: (err) => {
          this.isLoadingRooms.set(false);
          this.roomAvailability.set(null);
        }
      });
    }
  }

  onLocationChange() {
    // Rafraîchir la vérification de disponibilité quand la salle change
    if (this.selectedLocation && this.startDateValue && this.endDateValue) {
      this.onDateChange();
    } else {
      this.roomAvailability.set(null);
    }
  }

  private updateRoomAvailability() {
    if (!this.selectedLocation || !this.startDateValue || !this.endDateValue) {
      this.roomAvailability.set(null);
      return;
    }

    this.eventsService
      .getRoomSlots(this.selectedLocation, this.startDateValue, this.endDateValue)
      .subscribe({
        next: (slots) => {
          const isAvailable = slots.length === 0;
          this.roomAvailability.set(isAvailable);
        },
        error: (err) => {
          this.roomAvailability.set(null);
        },
      });
  }
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
    if (form.valid) {
      const eventData = {
        title: form.value.title,
        description: form.value.description,
        startDate: form.value.startDate,
        endDate: form.value.endDate,
        location: form.value.location,
        capacity: form.value.capacity
      };

      this.eventsService.createEvent(eventData, this.selectedFile()).subscribe({
        next: (response) => {
          this.toastr.success('Événement créé avec succès !');
          this.router.navigate(['/organizer/dashboard']);
        },
        error: (err) => {

          if (err.status === 409) {
            this.toastr.error("La salle sélectionnée n'est plus disponible. Veuillez réactualiser.");
            this.onDateChange();
          } else {
            const errorMessage = err.error?.message || 'Erreur lors de la création de l\'événement';
            this.toastr.error(errorMessage);
          }
        }
      });
    } else {
      form.form.markAllAsTouched();
    }
  }
  return() {
    this.router.navigate(['/organizer/dashboard']);
  }

  reserveRoom() {
    if (!this.isRoomAvailable()) {
      this.toastr.warning('Ce créneau n\'est pas disponible pour cette salle.');
      return;
    }
    
    const eventTitle = this.eventTitleValue.trim();

    // Envoyer une demande de réservation au dashboard admin
    const reservationData = {
      room: this.selectedLocation,
      startDate: this.startDateValue,
      endDate: this.endDateValue,
      ...(eventTitle ? { eventTitle } : {}),
    };

    this.eventsService.requestRoomReservation(reservationData).subscribe({
      next: (response) => {
        this.toastr.success('Demande de réservation envoyée à l\'administrateur. En attente d\'approbation.');
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Erreur lors de l\'envoi de la demande de réservation';
        this.toastr.error(errorMessage);
      }
    });
  }
}
