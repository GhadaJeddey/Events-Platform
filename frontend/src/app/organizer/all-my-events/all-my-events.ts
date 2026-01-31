import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EventsService } from '../../services/events';
import { Event } from '../../Models/Event';
import { EventCard } from '../../events/event-card/event-card';

@Component({
    selector: 'app-all-my-events',
    standalone: true,
    imports: [CommonModule, RouterLink, EventCard],
    templateUrl: './all-my-events.html',
    styleUrl: './all-my-events.css'
})
export class AllMyEvents implements OnInit {
    private eventsService = inject(EventsService);
    private router = inject(Router);

    events = signal<Event[] | null>(null);
    selectedFilter = signal<string>('all');

    allEvents = computed(() => this.events() || []);

    pendingEvents = computed(() => 
        (this.events() || []).filter(e => e.approvalStatus === 'pending')
    );

    approvedEvents = computed(() => 
        (this.events() || []).filter(e => e.approvalStatus === 'approved')
    );

    rejectedEvents = computed(() => 
        (this.events() || []).filter(e => e.approvalStatus === 'rejected')
    );

    filteredEvents = computed(() => {
        const filter = this.selectedFilter();
        const all = this.events() || [];
        
        switch(filter) {
            case 'pending': return this.pendingEvents();
            case 'approved': return this.approvedEvents();
            case 'rejected': return this.rejectedEvents();
            default: return all;
        }
    });

    ngOnInit() {
        this.loadEvents();
    }

    loadEvents() {
        this.eventsService.getMyEvents().subscribe({
            next: (data) => this.events.set(data),
            error: (err) => {}
        });
    }

    setFilter(filter: string) {
        this.selectedFilter.set(filter);
    }

    goBack() {
        this.router.navigate(['/organizer/dashboard']);
    }
}