import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Event } from '../Models/Event';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../Commun/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  // Injection de HttpClient
  private http = inject(HttpClient);

  // URL du backend depuis l'environnement
  private apiUrl = environment.apiUrl;

  // Méthode pour récupérer tous les événements publics
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/public`);
  }

  // Méthode pour récupérer un événement par ID
  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`);
  }

  // Méthode pour créer un événement avec upload d'image
  createEvent(eventData: any, imageFile: File | null, userId: string = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'): Observable<any> {
    const formData = new FormData();

    // Ajouter tous les champs du formulaire
    formData.append('title', eventData.title);
    formData.append('description', eventData.description);
    formData.append('startDate', eventData.startDate);
    formData.append('endDate', eventData.endDate);
    formData.append('location', eventData.location);
    formData.append('capacity', eventData.capacity.toString());

    // Ajouter l'image si elle existe
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http.post(`${this.apiUrl}/events/create/${userId}`, formData);
  }

  // Méthode pour mettre à jour un événement (PATCH)
  updateEvent(id: string, eventData: any, imageFile: File | null = null): Observable<any> {
    const formData = new FormData();
    if (eventData.title) formData.append('title', eventData.title);
    if (eventData.description) formData.append('description', eventData.description);
    if (eventData.startDate) formData.append('startDate', eventData.startDate);
    if (eventData.endDate) formData.append('endDate', eventData.endDate);
    if (eventData.location) formData.append('location', eventData.location);
    if (eventData.capacity) formData.append('capacity', eventData.capacity.toString());

    if (imageFile) {
      formData.append('image', imageFile);
    }

    // Note: Le backend actuel attend du JSON pour Patch, 
    // mais si on veut gérer l'image, FormData est nécessaire.
    // Si pas d'image, on pourrait envoyer du JSON pur.
    if (!imageFile) {
      return this.http.patch(`${this.apiUrl}/events/${id}`, eventData);
    }

    return this.http.patch(`${this.apiUrl}/events/${id}`, formData);
  }
}
