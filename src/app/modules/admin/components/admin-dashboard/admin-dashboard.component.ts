import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  verified: boolean;
  identification_type: string;
  identification_number: string;
  gender: string;
  created_at: string;
  city_name: string;
  department_name: string;
  plan_name: string | null;
}

interface StatsData {
  totalUsers: number;
  individualPlan: number;
  familyPlan: number;
}

interface PlanOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    AvatarModule,
    ButtonModule,
    ChartModule,
    CardModule,
  ],
})
export class DashboardComponent implements OnInit {
  // Data properties
  statsData: StatsData = {
    totalUsers: 0,
    individualPlan: 0,
    familyPlan: 0,
  };

  user: User[] = [];
  filteredUsers: User[] = [];
  
  // Additional stats for quick summary
  verifiedUsers: number = 0;
  pendingUsers: number = 0;
  usersWithoutPlan: number = 0;

  // Chart data
  chartData: any;
  chartOptions: any;

  // Filter properties
  searchTerm: string = '';
  selectedPlan: string = 'all';

  // Dropdown options
  planOptions: PlanOption[] = [
    { label: 'Todos los planes', value: 'all' },
    { label: 'Plan Individual', value: 'Individual' },
    { label: 'Plan Familiar', value: 'Familiar' },
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadData();
    this.initChart();
  }

  // Simulated data loading - replace with your actual service calls
  loadData(): void {
    this.adminService.getUsers().subscribe((userData) => {
      this.user = userData.data;

      // Solo después de que se cargan los datos
      this.calculateStats();
      this.updateChart();
      this.applyFilters();

      console.log('Usuarios cargados:', this.user);
    });
  }

  calculateStats(): void {
    this.statsData.totalUsers = this.user.length;
    this.statsData.individualPlan = this.user.filter(
      (user) => user.plan_name === 'Individual',
    ).length;
    this.statsData.familyPlan = this.user.filter(
      (user) => user.plan_name === 'Familiar',
    ).length;
    
    // Calculate additional stats
    this.verifiedUsers = this.user.filter(user => user.verified).length;
    this.pendingUsers = this.user.filter(user => !user.verified).length;
    this.usersWithoutPlan = this.user.filter(user => !user.plan_name).length;
  }

  initChart(): void {
    this.chartOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} usuarios (${percentage}%)`;
            }
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };
  }

  updateChart(): void {
    this.chartData = {
      labels: ['Plan Individual', 'Plan Familiar'],
      datasets: [
        {
          data: [this.statsData.individualPlan, this.statsData.familyPlan],
          backgroundColor: [
            'var(--blue-500)',
            'var(--orange-500)'
          ],
          borderColor: [
            'var(--blue-400)',
            'var(--orange-400)'
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            'var(--blue-400)',
            'var(--orange-400)'
          ]
        }
      ]
    };
  }

  // Filter methods
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onSearchChange(target.value);
  }

  onPlanFilterChange(value: string): void {
    this.selectedPlan = value;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredUsers = this.user.filter((user) => {
      const matchesSearch =
        !this.searchTerm ||
        user.first_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesPlan =
        this.selectedPlan === 'all' || user.plan_name === this.selectedPlan;

      return matchesSearch && matchesPlan;
    });
  }

  // Helper methods
  getUserInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getVerifiedText(verified: boolean): string {
    return verified ? 'Verificado' : 'Pendiente';
  }

  getVerifiedSeverity(verified: boolean): 'success' | 'warning' {
    return verified ? 'success' : 'warning';
  }

  getGenderText(gender: string): string {
    const genderMap: { [key: string]: string } = {
      M: 'Masculino',
      F: 'Femenino',
      O: 'Otro',
    };
    return genderMap[gender] || gender;
  }

  getPlanSeverity(planName: string): 'info' | 'warning' {
    return planName === 'Individual' ? 'info' : 'warning';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPercentage(value: number, total: number): string {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  }
}