import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventsService } from '../../services/events';
import { CommonModule } from '@angular/common';

interface MajorStats {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface TimelineDay {
  date: string;
  label: string;
  shortLabel: string;
  count: number;
}

interface PeakStats {
  peakDay: {
    date: string;
    count: number;
  };
  peakHour: {
    time: string;
    count: number;
  };
}

@Component({
  selector: 'app-event-statistics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-statistics.html',
  styleUrl: './event-statistics.css'
})
export class EventStatisticsComponent implements OnInit {
  private eventsService = inject(EventsService);
  private route = inject(ActivatedRoute);

  statistics = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Computed signals for new statistics
  majorDistribution = computed<MajorStats[]>(() => {
    const stats = this.statistics();
    if (!stats || !stats.majorDistribution) return [];

    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    ];

    const total = stats.participants || 0;
    const majorsOrder = ['IIA', 'IMI', 'GL', 'RT'];

    return majorsOrder.map((major, index) => {
      const entry = stats.majorDistribution.find((m: any) => (m.major || '').toUpperCase() === major);
      const count = entry ? entry.count : 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

      return {
        name: major,
        count,
        percentage,
        color: colors[index % colors.length],
      } as MajorStats;
    });
  });

  registrationTimeline = computed<TimelineDay[]>(() => {
    const stats = this.statistics();
    if (!stats || !stats.registrationsByDay) return [];
    
    return stats.registrationsByDay.map((day: any) => {
      const date = new Date(day.date);
      return {
        date: day.date,
        label: date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'short' 
        }),
        shortLabel: date.toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'short' 
        }),
        count: day.count
      };
    });
  });

  peakRegistrations = computed<PeakStats>(() => {
    const stats = this.statistics();
    if (!stats) {
      return {
        peakDay: { date: '-', count: 0 },
        peakHour: { time: '-', count: 0 }
      };
    }

    // Find peak day
    let peakDay = { date: '-', count: 0 };
    if (stats.registrationsByDay && stats.registrationsByDay.length > 0) {
      const maxDay = stats.registrationsByDay.reduce((max: any, day: any) => 
        day.count > max.count ? day : max
      );
      const date = new Date(maxDay.date);
      peakDay = {
        date: date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        }),
        count: maxDay.count
      };
    }

    // Find peak hour
    let peakHour = { time: '-', count: 0 };
    if (stats.registrationsByHour && stats.registrationsByHour.length > 0) {
      const maxHour = stats.registrationsByHour.reduce((max: any, hour: any) => 
        hour.count > max.count ? hour : max
      );
      peakHour = {
        time: `${maxHour.hour}:00`,
        count: maxHour.count
      };
    }

    return { peakDay, peakHour };
  });

  // Math object for template access
  Math = Math;

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadStatistics(eventId);
    }
  }

  loadStatistics(eventId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.eventsService.getEventStatistics(eventId).subscribe({
      next: (data: any) => {
        this.statistics.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to load event statistics');
        this.loading.set(false);
      }
    });
  }

  getMaxRegistrations(): number {
    const timeline = this.registrationTimeline();
    if (timeline.length === 0) return 1;
    return Math.max(...timeline.map(day => day.count));
  }

  getStatusColor(fillRate: number): string {
    if (fillRate >= 90) return '#d32f2f';
    if (fillRate >= 70) return '#f57c00';
    if (fillRate >= 50) return '#fbc02d';
    return '#388e3c';
  }

  getGradientColor(fillRate: number): string {
    if (fillRate >= 90) {
      return 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)';
    }
    if (fillRate >= 70) {
      return 'linear-gradient(90deg, #fa709a 0%, #fee140 100%)';
    }
    if (fillRate >= 50) {
      return 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)';
    }
    return 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)';
  }

  getDaysRemaining(startDate: string | Date): number {
    const now = new Date();
    const start = new Date(startDate);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}