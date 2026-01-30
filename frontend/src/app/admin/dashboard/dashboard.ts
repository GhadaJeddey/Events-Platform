import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop'; 
import { AdminService } from '../../services/admin.service';
import { RouterLink } from '@angular/router';
import { Event } from '../../Models/Event';
import { Organizer } from '../../Models/organizer';
import { User } from '../../Models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private adminService = inject(AdminService);

  stats = toSignal(this.adminService.getDashboardStats(), { initialValue: null });
  recentActivity = toSignal(this.adminService.getRecentEvents(), { initialValue: [] });
  pendingEvents = signal<Event[]>([]);
  pendingOrganizers = signal<Organizer[]>([]);
  pendingRoomReservations = signal<any[]>([]);
  mostActiveOrganizers = signal<any[]>([]);
  users = signal<User[]>([]);
  inactiveSlots = signal<Set<string>>(new Set());
  currentDate = new Date();
  
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          color: '#a0aec0',
          padding: 15,
          font: { size: 12 }
        }
      }
    }
  };

  pieChartData = computed<ChartConfiguration<'pie'>['data']>(() => {
    const data = this.stats();
    
    if (!data) return { labels: [], datasets: [] };

    // Traduction des statuts en français
    const statusTranslations: Record<string, string> = {
      'approved': 'Approuvés',
      'pending': 'En attente',
      'rejected': 'Rejetés',
      'cancelled': 'Annulés',
    };

    const colorMap: Record<string, string> = {
      'approved': '#6fef9a',  
      'pending': '#667eea',   
      'rejected': '#f5576c',  
      'cancelled': '#764ba2',
    };

    const labels = data.details.eventsByApprovalStatus.map(d => d.approvalStatus);
    const counts = data.details.eventsByApprovalStatus.map(d => parseInt(d.count));
    
    const bgColors = labels.map(label => colorMap[label] || '#cbd5e0');

    return {
      labels: labels.map(l => statusTranslations[l] || l),
      datasets: [{ 
        data: counts, 
        backgroundColor: bgColors,
        hoverBackgroundColor: bgColors,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  });

  // Options pour le Bar Chart (Salles)
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { stepSize: 1, color: '#a0aec0' },
        grid: { color: 'rgba(102, 126, 234, 0.1)' }
      }, 
      x: { 
        grid: { display: false },
        ticks: { color: '#a0aec0' }
      }
    },
    plugins: {
      legend: { display: false }, 
      title: { display: true, text: 'Occupation des Salles (Top 10)', color: '#764ba2' }
    }
  };

  // Computed pour transformer les données du backend en Graphique
  roomChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const data = this.stats();
    if (!data || !data.details.eventsByLocation) return { labels: [], datasets: [] };

    // On trie pour avoir les salles les plus utilisées en premier
    const sortedLocs = [...data.details.eventsByLocation]
        .sort((a, b) => parseInt(b.count) - parseInt(a.count))
        .slice(0, 10); 

    return {
      labels: sortedLocs.map(l => l.location),
      datasets: [{
        data: sortedLocs.map(l => parseInt(l.count)),
        backgroundColor: 'rgba(102, 126, 234, 0.8)', 
        borderColor: '#667eea',
        borderWidth: 1,
        borderRadius: 5,
        barThickness: 30
      }]
    };
  });

  ngOnInit() {
    this.loadPendingEvents();
    this.loadPendingOrganizers();
    this.loadPendingRoomReservations();
    this.loadUsers();
    this.loadMostActiveOrganizers();
  }

  loadPendingEvents() {
    this.adminService.getPendingEvents().subscribe({
      next: (events) => this.pendingEvents.set(events || []),
      error: (err) => console.error('Error loading pending events:', err)
    });
  }

  loadPendingOrganizers() {
    this.adminService.getPendingOrganizers().subscribe({
      next: (organizers) => this.pendingOrganizers.set(organizers || []),
      error: (err) => console.error('Error loading pending organizers:', err)
    });
  }

  loadPendingRoomReservations() {
    this.adminService.getPendingRoomReservations().subscribe({
      next: (reservations) => this.pendingRoomReservations.set(reservations || []),
      error: (err) => console.error('Error loading pending room reservations:', err)
    });
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (users) => this.users.set(users || []),
      error: (err) => console.error('Error loading users:', err)
    });
  }

  loadMostActiveOrganizers() {
    this.adminService.getMostActiveOrganizers().subscribe({
      next: (organizers) => {
        console.log('Most Active Organizers:', organizers);
        this.mostActiveOrganizers.set(organizers || []);
      },
      error: (err) => console.error('Error loading most active organizers:', err)
    });
  }

  approveEvent(eventId: string) {
    this.adminService.updateEventStatus(eventId, 'approved').subscribe({
      next: () => {
        const updated = this.pendingEvents().filter(e => e.id !== eventId);
        this.pendingEvents.set(updated);
      },
      error: (err) => console.error('Error approving event:', err)
    });
  }

  rejectEvent(eventId: string) {
    this.adminService.updateEventStatus(eventId, 'rejected').subscribe({
      next: () => {
        const updated = this.pendingEvents().filter(e => e.id !== eventId);
        this.pendingEvents.set(updated);
      },
      error: (err) => console.error('Error rejecting event:', err)
    });
  }

  approveOrganizer(organizerId: string) {
    this.adminService.updateOrganizerStatus(organizerId, 'APPROVED').subscribe({
      next: () => {
        const updated = this.pendingOrganizers().filter(o => o.id !== organizerId);
        this.pendingOrganizers.set(updated);
      },
      error: (err) => console.error('Error approving organizer:', err)
    });
  }

  rejectOrganizer(organizerId: string) {
    this.adminService.updateOrganizerStatus(organizerId, 'REJECTED').subscribe({
      next: () => {
        const updated = this.pendingOrganizers().filter(o => o.id !== organizerId);
        this.pendingOrganizers.set(updated);
      },
      error: (err) => console.error('Error rejecting organizer:', err)
    });
  }

  getHourlySlots(event: Event): string[] {
    if (!event.startDate || !event.endDate) return [];

    const start = new Date(event.startDate as any);
    const end = new Date(event.endDate as any);
    const slots: string[] = [];

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return slots;

    const current = new Date(start);
    current.setMinutes(0, 0, 0);

    while (current < end) {
      const next = new Date(current);
      next.setHours(current.getHours() + 1);
      slots.push(`${this.formatTime(current)} - ${this.formatTime(next)}`);
      current.setHours(current.getHours() + 1);
    }

    return slots;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  toggleSlot(eventId: string, slotLabel: string) {
    const key = `${eventId}|${slotLabel}`;
    const current = new Set(this.inactiveSlots());
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    this.inactiveSlots.set(current);
  }

  isSlotInactive(eventId: string, slotLabel: string): boolean {
    return this.inactiveSlots().has(`${eventId}|${slotLabel}`);
  }
} 