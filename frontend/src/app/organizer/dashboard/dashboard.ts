import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventsService } from '../../services/events';
import { Event } from '../../Models/Event';
import { EventCard } from '../../events/event-card/event-card';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
    selector: 'app-organizer-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, EventCard, ButtonComponent],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class OrganizerDashboard implements OnInit {
    private authService = inject(AuthService);
    private eventsService = inject(EventsService);
    private router = inject(Router);

    currentUser = this.authService.currentUser;
    events = signal<Event[] | null>(null);
    currentDate = new Date();

    myEvents = computed(() => {
        const user = this.currentUser();
        const all = this.events();
        if (!all) return [];
        return all;
    });

    stats = computed(() => {
        const list = this.myEvents();
        if (!list) return null;

        const total = list.length;
        const upcoming = list.filter(e => e.eventStatus === 'upcoming').length;
        const ongoing = list.filter(e => e.eventStatus === 'ongoing').length;
        const completed = list.filter(e => e.eventStatus === 'completed').length;
        const pending = list.filter(e => e.approvalStatus === 'pending').length;
        const rejected = list.filter(e => e.approvalStatus === 'rejected').length;
        const cancelled = list.filter(e => e.approvalStatus === 'cancelled').length;

        const participants = list.reduce((acc, e) => acc + (e.currentRegistrations || 0), 0);
        const capacity = list.reduce((acc, e) => acc + (e.capacity || 0), 0);
        const fillRate = capacity ? Math.round((participants / capacity) * 100) : 0;

        const currentYear = new Date().getFullYear();
        const createdThisYear = list.filter(e => {
            if (!e.createdAt) return false;
            const d = new Date(e.createdAt as any);
            return d.getFullYear() === currentYear;
        }).length;

        return {
            total,
            upcoming,
            ongoing,
            completed,
            pending,
            rejected,
            cancelled,
            participants,
            fillRate,
            createdThisYear,
        };
    });

    statusBreakdown = computed(() => {
        const list = this.myEvents();
        const counts = {
            upcoming: 0,
            ongoing: 0,
            completed: 0,
            pending: 0,
            rejected: 0,
            cancelled: 0,
        };
        if (!list) return counts;
        for (const e of list) {
            if (e.eventStatus && counts[e.eventStatus as keyof typeof counts] !== undefined) {
                counts[e.eventStatus as keyof typeof counts]++;
            }
            if (e.approvalStatus && counts[e.approvalStatus as keyof typeof counts] !== undefined) {
                counts[e.approvalStatus as keyof typeof counts]++;
            }
        }
        return counts;
    });

    eventsPerMonth = computed(() => {
        const list = this.myEvents();
        const months = Array.from({ length: 12 }, () => 0);
        if (!list) return months;
        for (const e of list) {
            if (!e.createdAt) continue;
            const d = new Date(e.createdAt as any);
            months[d.getMonth()]++;
        }
        return months;
    });

    maxEventsPerMonth = computed(() => {
        const months = this.eventsPerMonth();
        return Math.max(...months, 1);
    });

    svgPoints = computed(() => {
        const months = this.eventsPerMonth();
        const max = this.maxEventsPerMonth();
        return months
            .map((v, i) => {
                const x = 60 + (i / 11) * 590;
                const y = 250 - (v / max) * 180;
                return `${x},${y}`;
            })
            .join(' ');
    });

    svgAreaPoints = computed(() => {
        const months = this.eventsPerMonth();
        const max = this.maxEventsPerMonth();
        const linePoints = months
            .map((v, i) => {
                const x = 60 + (i / 11) * 590;
                const y = 250 - (v / max) * 180;
                return `${x},${y}`;
            });
        // Add bottom baseline for area fill
        const allPoints = linePoints.slice();
        allPoints.push(`650,250`);
        allPoints.push(`50,250`);
        return allPoints.join(' ');
    });

    ngOnInit() {
        this.load();
    }

    load() {
        this.eventsService.getMyEvents().subscribe({
            next: (data) => this.events.set(data),
            error: (err) => console.error('Erreur events', err)
        });
    }

    goToCreateEvent(): void {
        this.router.navigate(['/events/create']);
    }
}
