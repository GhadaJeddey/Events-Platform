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
export class DashboardComponent {
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

   
    const colorMap: Record<string, string> = {
      'approved': '#667eea',  
      'pending': '#764ba2',   
      'rejected': '#3f5f95',  
      'cancelled': '#cbd5e0',
    };

    const labels = data.details.eventsByApprovalStatus.map(d => d.approvalStatus);
    const counts = data.details.eventsByApprovalStatus.map(d => parseInt(d.count));
    
    const bgColors = labels.map(label => colorMap[label] || '#cbd5e0');

    return {
      labels: labels.map(l => l.toUpperCase()), // Mettre en majuscule pour l'affichage
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