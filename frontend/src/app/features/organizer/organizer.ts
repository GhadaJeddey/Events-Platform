import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrganizerDashboard } from './dashboard/dashboard';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
  bgColor: string;
}

interface Activity {
  title: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}

@Component({
  selector: 'app-organizer',
  imports: [CommonModule, OrganizerDashboard],
  templateUrl: './organizer.html',
  styleUrl: './organizer.css',
})
export class Organizer implements OnInit {
  private router = inject(Router);

  stats: StatCard[] = [
    {
      title: 'Total Tasks',
      value: 156,
      change: 12.5,
      icon: '📋',
      color: '#6366f1',
      bgColor: '#eef2ff'
    },
    {
      title: 'Completed',
      value: 89,
      change: 8.2,
      icon: '✅',
      color: '#10b981',
      bgColor: '#ecfdf5'
    },
    {
      title: 'In Progress',
      value: 42,
      change: -3.1,
      icon: '⏳',
      color: '#f59e0b',
      bgColor: '#fffbeb'
    },
    {
      title: 'Productivity',
      value: '87%',
      change: 5.4,
      icon: '📈',
      color: '#8b5cf6',
      bgColor: '#f5f3ff'
    }
  ];

  recentActivities: Activity[] = [
    { title: 'Project proposal completed', time: '2 hours ago', type: 'success' },
    { title: 'Team meeting scheduled', time: '4 hours ago', type: 'info' },
    { title: 'Deadline approaching', time: '5 hours ago', type: 'warning' },
    { title: 'Code review finished', time: '1 day ago', type: 'success' }
  ];

  projectProgress = [
    { name: 'Website Redesign', progress: 75, color: '#6366f1' },
    { name: 'Mobile App', progress: 45, color: '#10b981' },
    { name: 'Marketing Campaign', progress: 90, color: '#f59e0b' },
    { name: 'Database Migration', progress: 30, color: '#8b5cf6' }
  ];

  ngOnInit() {
    // Initialize component
  }

  getActivityIcon(type: string): string {
    switch(type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  }

  getActivityColor(type: string): string {
    switch(type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  goToCreateEvent(): void {
    this.router.navigate(['/events/create']);
  }
}