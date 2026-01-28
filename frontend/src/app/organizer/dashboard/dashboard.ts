import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventsService } from '../../services/events';
import { Event } from '../../Models/Event';
import { EventCard } from '../../events/event-card/event-card';
import { ButtonComponent } from '../../shared/components/button/button';
import { count } from 'rxjs';

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
    // Dans ta classe DashboardComponent
    months: string[] = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

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

    // mapping des status 
    getStatusLabel(status: string): string {
        const translations: { [key: string]: string } = {
            // Event Status
            'upcoming': 'À venir',
            'ongoing': 'En cours',
            'completed': 'Terminés',
            // Approval Status
            'pending': 'En attente',
            'approved': 'Approuvés',
            'rejected': 'Rejetés',
            'cancelled': 'Annulés'
        };
        return translations[status] || status;
    }

    statusBreakdown = computed(() => {
        const list = this.myEvents();
        console.log('Calculating status breakdown for events:', list);
        const counts = {
            'À venir': 0,
            'En cours': 0,
            'Terminés': 0,
            'En attente': 0,
            'Approuvés': 0,
            'Rejetés': 0,
            'Annulés': 0
        };
        if (!list) return counts;
        for (const e of list) {
            // Count by eventStatus
            if (e.eventStatus) {
                const label = this.getStatusLabel(e.eventStatus);
                console.log(`Event ID: ${e.id}, Status: ${e.eventStatus}, Label: ${label}`);
                if (counts[label as keyof typeof counts] !== undefined) {
                    counts[label as keyof typeof counts]++;
                }
                console.log('Updated counts:', counts);
            }
            // Count by approvalStatus
            if (e.approvalStatus) {
                const label = this.getStatusLabel(e.approvalStatus);
                if (counts[label as keyof typeof counts] !== undefined) {
                    counts[label as keyof typeof counts]++;
                }
            }
        }
        console.log('Final status breakdown counts:', counts);
        return counts;
    });

    maxStatusCount = computed(() => {
        const breakdown = this.statusBreakdown();
        const values = Object.values(breakdown);
        return Math.max(...values, 1);
    });

    eventsPerMonth = computed(() => {
        const list = this.myEvents();
        const months = Array.from({ length: 12 }, () => 0);
        if (!list) return months;
        for (const e of list) {
            if (!e.startDate) continue;
            const d = new Date(e.startDate as any);
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
    getMaxValue(): number {
        const values = Object.values(this.statusBreakdown());
        return Math.max(...values, 1);
    }


    ngOnInit() {
        this.load();
    }

    load() {
        console.log('Calling getMyEvents...');
        this.eventsService.getMyEvents().subscribe({
            next: (data) => {
                console.log('Received events:', data);
                this.events.set(data);
            },
            error: (err) => {
                console.error('Error loading events:', err);
            }
        });
    }

    goToCreateEvent(): void {
        this.router.navigate(['/events/create']);
    }
    goToReserveRooms(): void {
    // verifier avec sana 
    }
}