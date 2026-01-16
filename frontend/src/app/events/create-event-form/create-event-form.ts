import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { EventsService } from '../../services/events';

@Component({
  selector: 'app-create-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
      const formData = form.value;
      const imagePath = `assets/eventimages/${this.selectedFile.name}`;

      const newEvent = {
        ...formData,
        imageUrl: imagePath,
        currentRegistrations: 0,
        eventStatus: 'upcoming',
        approvalStatus: 'pending'
      };

      console.log('Nouvel évènement (Template-driven):', newEvent);
      alert('Évènement créé avec succès !');
      this.router.navigate(['/events']);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      form.form.markAllAsTouched();

    }
  }
}
