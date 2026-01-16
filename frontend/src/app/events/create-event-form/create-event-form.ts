import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { EventsService } from '../../services/events';

@Component({
  selector: 'app-create-event-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-event-form.html',
  styleUrl: './create-event-form.css',
})
export class CreateEventForm {
  private eventsService = inject(EventsService);
  private router = inject(Router);

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(form: NgForm) {
    // La validation de l'image est manuelle car ngModel ne gère pas nativement les fichiers
    if (form.valid && this.selectedFile) {
      const eventData = {
        title: form.value.title,
        description: form.value.description,
        startDate: form.value.startDate,
        endDate: form.value.endDate,
        location: form.value.location,
        capacity: form.value.capacity
      };

      // Envoyer au backend avec l'image
      this.eventsService.createEvent(eventData, this.selectedFile).subscribe({
        next: (response) => {
          console.log('Événement créé avec succès:', response);
          alert('Événement créé avec succès !');
          this.router.navigate(['/events']);
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          alert('Erreur lors de la création de l\'événement');
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      form.form.markAllAsTouched();
    }
  }
}
