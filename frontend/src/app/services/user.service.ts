import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../shared/models/auth.models';
import { environment } from '../shared/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  // 1. Get Profile (View Mode)
  getProfile(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  // 2. Update Profile (Edit Mode)
  updateProfile(userId: string, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, userData);
  }
}
