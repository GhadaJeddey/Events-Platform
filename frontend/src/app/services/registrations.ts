import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Registration } from '../Models/registration.model'; 
// import { environment } from '../../environments/environment'; // Si tu as une variable d'env

@Injectable({
  providedIn: 'root'
})
export class RegistrationsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000'; // Ou environment.apiUrl

  // 👇 C'est cette méthode que le Dashboard appelle
  getMyRegistrations(): Observable<Registration[]> {
    // Elle appelle la route du Controller NestJS : @Get('my-registrations')
    return this.http.get<Registration[]>(`${this.apiUrl}/registrations/my-registrations`);
  }

  // Méthode pour s'inscrire
  register(eventId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrations`, { eventId });
  }

  // Méthode pour annuler
  cancel(registrationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/registrations/${registrationId}/cancel`);
  }
}