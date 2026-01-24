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

      // Envoyer au backend avec l'image
      this.eventsService.createEvent(eventData, this.selectedFile()).subscribe({
        next: (response) => {
          this.toastr.success('Événement créé avec succès !');
          this.router.navigate(['/events']);
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Erreur lors de la création de l\'événement';
          this.toastr.error(errorMessage);
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      form.form.markAllAsTouched();
    }
  }
}
