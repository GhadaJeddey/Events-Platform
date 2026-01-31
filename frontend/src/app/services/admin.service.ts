import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event } from '../Models/Event';
import { User, UserRole } from '../Models/auth.models';
import { DashboardStats } from '../Models/AdminStats';
import { Organizer } from '../Models/Organizer';
import { environment } from '../../../Commun/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/admin';
  private eventsApiUrl = `${environment.apiUrl}/events`;

  // --- EVENTS ---
  getPendingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/pending`);
  }

  updateEventStatus(id: string, status: string): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/events/${id}/status`, { status });
  }

  // --- USERS ---
  getAllUsers(): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}/users`).pipe(
      map(response => response.data || [])
    );
  }

  updateUserRole(id: string, role: UserRole): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/role`, { role });
  }

  // --- ORGANIZERS ---
  getPendingOrganizers(): Observable<Organizer[]> {
    return this.http.get<Organizer[]>(`${this.apiUrl}/organizers/pending`);
  }

  getMostActiveOrganizers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/organizers/most-active`);
  }

  updateOrganizerStatus(id: string, status: 'APPROVED' | 'REJECTED'): Observable<Organizer> {
    return this.http.patch<Organizer>(`${this.apiUrl}/organizers/${id}/status`, { status });
  }

  // --- ROOM RESERVATIONS ---
  getPendingRoomReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.eventsApiUrl}/rooms/reservations/pending`);
  }

  approveRoomReservation(id: string): Observable<any> {
    return this.http.patch(`${this.eventsApiUrl}/rooms/reservations/${id}/approve`, {});
  }

  rejectRoomReservation(id: string, rejectionReason?: string): Observable<any> {
    return this.http.patch(`${this.eventsApiUrl}/rooms/reservations/${id}/reject`, { rejectionReason });
  }

  // --- STATS ---
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/reports`);
  }
  getRecentEvents(limit: number = 5) {
  return this.http.get<Event[]>(`${this.apiUrl}/recent-activity`);
}
}
