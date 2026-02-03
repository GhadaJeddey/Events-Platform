import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { EventsService } from '../../../services/events';
import { Event } from '../../../shared/models/Event';
import { EventCard } from '../../events/event-card/event-card';
import { LoaderComponent } from '../../../shared/components/loader/loader';
import { SearchComponent } from '../../../shared/components/search/search';

@Component({
    selector: 'app-all-my-events',
    standalone: true,
    imports: [CommonModule, RouterLink, EventCard, LoaderComponent, SearchComponent],
    templateUrl: './all-my-events.html',
    styleUrl: './all-my-events.css'
})
export class AllMyEvents implements OnInit {
    private eventsService = inject(EventsService);
    private router = inject(Router);

    events = signal<Event[] | null>(null);
    isLoading = signal(true);
    selectedFilter = signal<string>('all');
    searchTerm = signal('');

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
        const term = this.searchTerm().toLowerCase();
        const all = this.events() || [];
        
        let baseEvents: Event[];
        switch(filter) {
            case 'pending': baseEvents = this.pendingEvents(); break;
            case 'approved': baseEvents = this.approvedEvents(); break;
            case 'rejected': baseEvents = this.rejectedEvents(); break;
            default: baseEvents = all;
        }
        
        if (!term) return baseEvents;
        
        return baseEvents.filter(e =>
            e.title?.toLowerCase().includes(term) ||
            e.description?.toLowerCase().includes(term) ||
            e.location?.toLowerCase().includes(term)
        );
    });

    ngOnInit() {
        this.loadEvents();
    }

    loadEvents() {
        this.isLoading.set(true);
        this.eventsService.getMyEvents().subscribe({
            next: (data) => {
                this.events.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.isLoading.set(false);
            }
        });
    }

    setFilter(filter: string) {
        this.selectedFilter.set(filter);
    }

    onSearch(term: string) {
        this.searchTerm.set(term);
    }

    goBack() {
        this.router.navigate(['/organizer/dashboard']);
    }
}