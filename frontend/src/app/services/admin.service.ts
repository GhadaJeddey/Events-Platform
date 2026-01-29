import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../Models/Event';
import { User, UserRole } from '../Models/auth.models';
import { DashboardStats } from '../Models/AdminStats';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/admin';

  // --- EVENTS ---
  getPendingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events/pending`);
  }

  updateEventStatus(id: string, status: string): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/events/${id}/status`, { status });
  }

  // --- USERS ---
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  updateUserRole(id: string, role: UserRole): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/role`, { role });
  }

  // --- STATS ---
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/reports`);
  }
  getRecentEvents(limit: number = 5) {
  return this.http.get<Event[]>(`${this.apiUrl}/recent-activity`);
}
}
