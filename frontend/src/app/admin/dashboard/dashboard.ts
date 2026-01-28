import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { toSignal } from '@angular/core/rxjs-interop'; 
import { AdminService } from '../../services/admin.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  private adminService = inject(AdminService);

  stats = toSignal(this.adminService.getDashboardStats(), { initialValue: null });

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
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
      'approved': '#43e97b',  
      'pending': '#fa709a',   
      'rejected': '#f5576c',  
      'cancelled': '#6c757d',
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
} 