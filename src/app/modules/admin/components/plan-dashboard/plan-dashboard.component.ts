import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AdminService } from '../../../../core/services/admin.service';
import { Plan } from 'src/app/core/interfaces/admin.interface';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-plan-dashboard',
  templateUrl: './plan-dashboard.component.html',
  styleUrls: ['./plan-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    InputTextModule,
    FloatLabelModule,
    DropdownModule,
    TagModule,
    AvatarModule,
    ButtonModule,
    ChartModule,
    CardModule,
    InputNumberModule,
    InputTextarea,
    InputSwitchModule,
    ToastModule,
  ],
  providers: [MessageService]
})
export class PlanDashboardComponent implements OnInit {
  plans: Plan[] = [];
  filteredPlans: Plan[] = [];
  searchTerm: string = '';
  selectedStatus: boolean | null = null;
  
  // Formulario
  planForm!: FormGroup;
  isEditing: boolean = false;
  selectedPlan: Plan | null = null;
  showForm: boolean = false;
  
  // Opciones para el filtro de estado
  statusOptions = [
    { label: 'Todos los estados', value: null },
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  // Estadísticas de planes
  statsData = {
    totalPlans: 0,
    activePlans: 0,
    inactivePlans: 0
  };

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadData();
  }

  initializeForm(): void {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      duration_days: [30, [Validators.required, Validators.min(1)]],
      max_beneficiaries: [1, [Validators.required, Validators.min(1)]],
      is_active: [true],
      code: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  loadData(): void {
    this.adminService.getPlans().subscribe((planData) => {
      this.plans = planData.data;
      this.filteredPlans = [...this.plans];
      this.calculateStats();
    });
  }

  calculateStats(): void {
    this.statsData.totalPlans = this.plans.length;
    this.statsData.activePlans = this.plans.filter(plan => plan.is_active === true).length;
    this.statsData.inactivePlans = this.plans.filter(plan => plan.is_active === false).length;
  }

  onSearchInput(event: any): void {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  onStatusFilterChange(status: boolean | null): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredPlans = this.plans.filter(plan => {
      const matchesSearch = !this.searchTerm || 
        plan.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        plan.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.selectedStatus === null || plan.is_active === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  // Métodos para el formulario
  onCreatePlan(): void {
    this.isEditing = false;
    this.selectedPlan = null;
    this.showForm = true;
    this.planForm.reset({
      name: '',
      description: '',
      price: 0,
      duration_days: 30,
      max_beneficiaries: 1,
      is_active: true,
      code: ''
    });
  }

  onEditPlan(plan: Plan): void {
    this.isEditing = true;
    this.selectedPlan = plan;
    this.showForm = true;
    this.planForm.patchValue({
      name: plan.name,
      description: plan.description,
      price: parseFloat(plan.price),
      duration_days: plan.duration_days,
      max_beneficiaries: plan.max_beneficiaries,
      is_active: plan.is_active,
      code: plan.code
    });
  }

  onViewPlan(plan: Plan): void {
    this.selectedPlan = plan;
    this.showForm = true;
    this.isEditing = false;
    this.planForm.patchValue({
      name: plan.name,
      description: plan.description,
      price: parseFloat(plan.price),
      duration_days: plan.duration_days,
      max_beneficiaries: plan.max_beneficiaries,
      is_active: plan.is_active,
      code: plan.code
    });
    this.planForm.disable();
  }

  onCancelForm(): void {
    this.showForm = false;
    this.selectedPlan = null;
    this.isEditing = false;
    this.planForm.reset();
    this.planForm.enable();
  }

  onSubmitForm(): void {
    if (this.planForm.valid) {
      const formData = this.planForm.value;
      
      if (this.isEditing && this.selectedPlan) {
        // Actualizar plan existente
        const updatedPlan = { ...this.selectedPlan, ...formData };
        this.adminService.updatePlan(updatedPlan).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Plan actualizado correctamente'
            });
            this.loadData();
            this.onCancelForm();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el plan'
            });
          }
        });
      } else {
        // Crear nuevo plan
        this.adminService.createPlan(formData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Plan creado correctamente'
            });
            this.loadData();
            this.onCancelForm();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el plan'
            });
          }
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });
    }
  }

  // Métodos de utilidad existentes
  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatPrice(price: string): string {
    const numericPrice = parseFloat(price);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(numericPrice);
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  getStatusSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getDurationText(durationDays: number): string {
    if (durationDays < 30) {
      return `${durationDays} días`;
    } else if (durationDays < 365) {
      const months = Math.floor(durationDays / 30);
      return `${months} mes${months > 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(durationDays / 365);
      return `${years} año${years > 1 ? 's' : ''}`;
    }
  }

  // Métodos de validación para el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.planForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.planForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['minLength']) return `Mínimo ${field.errors['minLength'].requiredLength} caracteres`;
      if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}`;
    }
    return '';
  }
}