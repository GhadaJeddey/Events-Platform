import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsService } from '../../services/events';
import { Event } from '../../Models/Event';
import { environment } from '../../../../Commun/environments/environment';
import { InputDatePipe } from '../../../../Commun/pipes/input-date-pipe';
import { ToastrService } from 'ngx-toastr';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, of, tap } from 'rxjs';
import { LoaderComponent } from '../../shared/components/loader/loader';

@Component({
  selector: 'app-update-event',
  imports: [FormsModule, InputDatePipe, LoaderComponent],
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
      const eventData = form.value;

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
}
