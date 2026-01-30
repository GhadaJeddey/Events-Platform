import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Event } from '../Models/Event';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../Commun/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private apiUrl = environment.apiUrl;

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/public`);
  }

  getMyEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/mine`);
  }
  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`);
  }

  searchEvents(searchTerm: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/search`, {
      params: { q: searchTerm }
    });
  }

  getEventsByOrganizerId(organizerId: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/organizer/${organizerId}`);
  }

  createEvent(eventData: any, imageFile: File | null): Observable<any> {
    const formData = new FormData();

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

    return this.http.post(`${this.apiUrl}/events/create`, formData);
  }

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

    // Note: Le backend attend du JSON pour Patch, .
    // Si pas d'image, on pourrait envoyer du JSON pur.
    if (!imageFile) {
      return this.http.patch(`${this.apiUrl}/events/${id}/edit`, eventData);
    }

    return this.http.patch(`${this.apiUrl}/events/${id}/edit`, formData);
  }

  getEventStatistics(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/events/${id}/statistics`);
  }

  getAvailableRooms(start: string, end: string): Observable<string[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);

    return this.http.get<string[]>(`${this.apiUrl}/events/availability`, { params });
  }

  getRoomSlots(room: string, start: string, end: string): Observable<any[]> {
    const params = new HttpParams()
      .set('room', room)
      .set('start', start)
      .set('end', end);

    return this.http.get<any[]>(`${this.apiUrl}/events/availability/slots`, { params });
  }

  requestRoomReservation(reservationData: {
    room: string;
    startDate: string;
    endDate: string;
    eventTitle?: string;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/events/rooms/reserve`,
      reservationData
    );
  }
}
