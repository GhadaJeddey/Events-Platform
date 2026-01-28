import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { EventsService } from '../../services/events';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-event-form',
  imports: [FormsModule],
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

  // Variables liées aux inputs pour détecter les changements facilement
  startDateValue: string = '';
  endDateValue: string = '';

  // Appelé à chaque fois qu'une date change
  onDateChange() {
    if (this.startDateValue && this.endDateValue) {
      // Validation basique
      if (this.startDateValue >= this.endDateValue) {
        this.availableRooms.set([]); // Reset si dates invalides
        return;
      }

      this.isLoadingRooms.set(true);
      
      // Appel au service (Assure-toi que cette méthode existe dans ton service !)
      this.eventsService.getAvailableRooms(this.startDateValue, this.endDateValue).subscribe({
        next: (rooms) => {
          this.availableRooms.set(rooms);
          this.isLoadingRooms.set(false);
          
          // Petit feedback si aucune salle n'est dispo
          if (rooms.length === 0) {
            this.toastr.info('Aucune salle disponible pour ce créneau.');
          }
        },
        error: (err) => {
          console.error(err);
          this.isLoadingRooms.set(false);
        }
      });
    }
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
          //  Gestion spécifique erreur 409 (Salle prise) 
          if (err.status === 409) {
            this.toastr.error("La salle sélectionnée n'est plus disponible. Veuillez réactualiser.");
            this.onDateChange(); // On recharge la liste
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
}
