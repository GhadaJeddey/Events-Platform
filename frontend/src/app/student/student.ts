import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { LoaderComponent } from '../shared/components/loader/loader';
import { Footer } from '../footer/footer';
import { Navbar } from '../navbar/navbar';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventsService } from '../services/events';
import { RegistrationsService } from '../services/registrations';
import { Event } from '../Models/Event';
import { EventCard } from '../events/event-card/event-card';

@Component({
  selector: 'app-student',
  imports: [CommonModule, FormsModule, Navbar, Footer, LoaderComponent,EventCard],
  templateUrl: './student.html',
  styleUrl: './student.css',
})
export class Student implements OnInit {
  private eventsService = inject(EventsService);
  private registrationsService = inject(RegistrationsService);

  allEvents = signal<Event[] | null>(null);
  myEvents = signal<Event[] | null>(null);


  searchTerm = signal('');

  // --- Filtrer les événements de la semaine ---
  thisWeekEvents = computed(() => {
    const events = this.allEvents();
    if (!events) return [];

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    return events.filter(e => {
      const eventDate = new Date(e.startDate);
      return eventDate >= now && eventDate <= nextWeek;
    });
  });

  // --- Computed : Recherche sur TOUS les événements ---
  filteredAllEvents = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const events = this.allEvents();
    if (!events) return null;
    if (!term) return events;

    return events.filter(e =>
      e.title.toLowerCase().includes(term) ||
      e.location.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Charger tous les events
    this.eventsService.getEvents().subscribe({
      next: (data) => this.allEvents.set(data),
      error: (err) => {}
    });

    // Charger mes inscriptions
    this.registrationsService.getMyRegistrations().subscribe({
      next: (regs) => {
        // On extrait l'objet 'event' de chaque registration
        const events = regs.map(r => r.event);
        this.myEvents.set(events);
      },
      error: (err) => {}
    });
  }


}



