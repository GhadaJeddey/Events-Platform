import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventsService } from '../../services/events';
import { RegistrationsService } from '../../services/registrations';
import { Event } from '../../Models/Event';
import { EventCard } from '../../events/event-card/event-card';

@Component({
    selector: 'app-student-dashboard',
    standalone: true,
    imports: [CommonModule, EventCard],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class StudentDashboard implements OnInit {
    private authService = inject(AuthService);
    private eventsService = inject(EventsService);
    private registrationsService = inject(RegistrationsService);
    
    currentUser = this.authService.currentUser;
    allEvents = signal<Event[] | null>(null);
    myEvents = signal<Event[] | null>(null);
    isLoadingEvents = signal(true);
    isLoadingRegistrations = signal(true);
    
    myEventIds = computed(() => {
        const events = this.myEvents();
        return events ? new Set(events.map(e => e.id)) : new Set();
    });

    // Événements de cette semaine
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

    // Limiter l'affichage à 6 événements dans le dashboard
    limitedAllEvents = computed(() => {
        const events = this.allEvents();
        if (!events) return null;
        return events.slice(0, 5);
    });

    // Vérifier s'il y a plus d'événements
    hasMoreEvents = computed(() => {
        const events = this.allEvents();
        return events && events.length > 6;
    });

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        // Charger tous les événements
        this.isLoadingEvents.set(true);
        this.eventsService.getEvents().subscribe({
            next: (data) => {
                this.allEvents.set(data);
                this.isLoadingEvents.set(false);
            },
            error: (err) => {
                this.isLoadingEvents.set(false);
            }
        });

        // Charger mes inscriptions
        this.isLoadingRegistrations.set(true);
        this.registrationsService.getMyRegistrations().subscribe({
            next: (regs) => {
                const events = regs.map(r => r.event);
                this.myEvents.set(events);
                this.isLoadingRegistrations.set(false);
            },
            error: (err) => {
                this.isLoadingRegistrations.set(false);
            }
        });
       
    }

    onRegistrationCancelled() {
        this.loadData();
    }
}
