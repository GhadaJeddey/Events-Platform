import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../Commun/environments/environment';
import { Organizer } from '../Models/Organizer';

@Injectable({
  providedIn: 'root'
})
export class OrganizersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllOrganizers(): Observable<Organizer[]> {
    return this.http.get<Organizer[]>(`${this.apiUrl}/organizers`);
  }

  getOrganizerById(id: string): Observable<Organizer> {
    return this.http.get<Organizer>(`${this.apiUrl}/organizers/${id}`);
  }
}
