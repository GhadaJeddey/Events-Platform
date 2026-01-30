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
  roomAvailability = signal<boolean | null>(null);
  startDateValue: string = '';
  endDateValue: string = '';
  selectedLocation: string = '';

  // Vérifier si la salle sélectionnée est disponible pour le créneau
  isRoomAvailable = computed(() => {
    if (!this.selectedLocation || !this.startDateValue || !this.endDateValue) {
      return false;
    }
    if (this.roomAvailability() === false) return false;
    if (this.roomAvailability() === true) {
      return this.availableRooms().includes(this.selectedLocation);
    }
    return false;
  });

  private toLocalDateTimeString(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

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
              const startDate = new Date(event.startDate as any);
              const endDate = new Date(event.endDate as any);
              this.startDateValue = this.toLocalDateTimeString(startDate);
              this.endDateValue = this.toLocalDateTimeString(endDate);
              this.onDateChange();
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
      if (this.startDateValue >= this.endDateValue) {
        this.availableRooms.set([]);
        this.roomAvailability.set(false);
        return;
      }
      this.isLoadingRooms.set(true);
      console.log('🔍 [UPDATE] Vérification disponibilité salles:', {
        start: this.startDateValue,
        end: this.endDateValue
      });
      
      this.eventsService.getAvailableRooms(this.startDateValue, this.endDateValue).subscribe({
        next: (rooms) => {
          console.log('✅ [UPDATE] Salles disponibles reçues:', rooms);
          this.availableRooms.set(rooms);
          this.isLoadingRooms.set(false);
          this.updateRoomAvailability();
        },
        error: (err) => {
          console.error('❌ [UPDATE] Erreur getAvailableRooms:', err);
          this.availableRooms.set([]);
          this.isLoadingRooms.set(false);
          this.roomAvailability.set(null);
        },
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
      console.log('⚠️ [UPDATE] updateRoomAvailability: données manquantes');
      this.roomAvailability.set(null);
      return;
    }

    console.log('🔍 [UPDATE] Vérification créneaux pour salle:', {
      room: this.selectedLocation,
      start: this.startDateValue,
      end: this.endDateValue
    });

    this.eventsService
      .getRoomSlots(this.selectedLocation, this.startDateValue, this.endDateValue)
      .subscribe({
        next: (slots) => {
          console.log('📊 [UPDATE] Créneaux occupés reçus:', slots);
          const isAvailable = slots.length === 0;
          console.log(`${isAvailable ? '✅' : '❌'} [UPDATE] Salle disponible:`, isAvailable);
          this.roomAvailability.set(isAvailable);
        },
        error: (err) => {
          console.error('❌ [UPDATE] Erreur getRoomSlots:', err);
          this.roomAvailability.set(null);
        },
      });
  }

  reserveRoom() {
    console.log('🎯 [UPDATE] Tentative réservation salle:', {
      selectedLocation: this.selectedLocation,
      startDate: this.startDateValue,
      endDate: this.endDateValue,
      roomAvailability: this.roomAvailability(),
      isRoomAvailable: this.isRoomAvailable(),
      availableRooms: this.availableRooms()
    });

    if (!this.isRoomAvailable()) {
      console.warn('⚠️ [UPDATE] Réservation bloquée: créneau non disponible');
      this.toastr.warning('Ce créneau n\'est pas disponible pour cette salle.');
      return;
    }
    
    // Envoyer une demande de réservation au dashboard admin
    const reservationData = {
      room: this.selectedLocation,
      startDate: this.startDateValue,
      endDate: this.endDateValue,
      eventTitle: this.currentEvent()?.title,
    };

    console.log('📤 [UPDATE] Envoi demande réservation:', reservationData);

    this.eventsService.requestRoomReservation(reservationData).subscribe({
      next: (response) => {
        console.log('✅ [UPDATE] Réservation envoyée avec succès:', response);
        this.toastr.success('Demande de réservation envoyée à l\'administrateur. En attente d\'approbation.');
      },
      error: (err) => {
        console.error('❌ [UPDATE] Erreur envoi réservation:', err);
        const errorMessage = err.error?.message || 'Erreur lors de l\'envoi de la demande de réservation';
        this.toastr.error(errorMessage);
      }
    });
  }
}
