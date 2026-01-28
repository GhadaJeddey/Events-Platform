import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrganizersService } from '../../services/organizers.service';
import { EventsService } from '../../services/events';
import { switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Organizer } from '../../Models/Organizer';
import { Event } from '../../Models/Event';
import { LoaderComponent } from '../../shared/components/loader/loader';
import { EventCard } from '../../events/event-card/event-card';

@Component({
    selector: 'app-organizer-details',
    standalone: true,
    imports: [CommonModule, RouterLink, LoaderComponent, EventCard],
    templateUrl: './organizer-details.html',
    styleUrl: './organizer-details.css',
})
export class OrganizerDetails {
    private route = inject(ActivatedRoute);
    private organizersService = inject(OrganizersService);
    private eventsService = inject(EventsService);

    organizer = toSignal(this.route.paramMap.pipe(
        switchMap(params => {
            const id = params.get('id');
            return this.organizersService.getOrganizerById(id || '');
        })
    ));

    organizerEvents = toSignal(this.route.paramMap.pipe(
        switchMap(params => {
            const id = params.get('id');
            return this.eventsService.getEventsByOrganizerId(id || '');
        })
    ), { initialValue: [] });

    upcomingEvents = computed(() => {
        const events = this.organizerEvents() || [];
        return events.filter(e => e.eventStatus === 'upcoming');
    });

    ongoingEvents = computed(() => {
        const events = this.organizerEvents() || [];
        return events.filter(e => e.eventStatus === 'ongoing');
    });

    completedEvents = computed(() => {
        const events = this.organizerEvents() || [];
        return events.filter(e => e.eventStatus === 'completed');
    });

    totalParticipants = computed(() => {
        const events = this.organizerEvents() || [];
        return events.reduce((acc, e) => acc + (e.currentRegistrations || 0), 0);
    });

    totalCapacity = computed(() => {
        const events = this.organizerEvents() || [];
        return events.reduce((acc, e) => acc + (e.capacity || 0), 0);
    });
}
