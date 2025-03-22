import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CustomInputComponent } from 'src/app/pages/components/inputs/custom-input/custom-input.component';
import { UserHealthService } from 'src/app/core/services/user-health.service';
import { FamilyHistory, MedicalHistory } from 'src/app/core/interfaces/beneficiary.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { historyTypeOptions, relativeOptions } from 'src/app/core/constants/options';

@Component({
  selector: 'app-user-medical-history-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    CustomInputComponent
  ],
  templateUrl: './user-medical-history-form.component.html',
  styleUrls: ['./user-medical-history-form.component.scss']
})
export class UserMedicalHistoryFormComponent implements OnInit {
  healthHistoryForm: FormGroup;
  isSubmitting = false;
  userId: number | null = null;
  
  historyTypeOptions = historyTypeOptions;
  relativeOptions = relativeOptions;

  constructor(
    private fb: FormBuilder,
    private userHealthService: UserHealthService,
    private userService: UserService,
    private toastCtrl: ToastController
  ) {
    this.healthHistoryForm = this.fb.group({
      medicalHistory: this.fb.array([]),
      familyHistory: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Obtener el ID del usuario
    const user = this.userService.getUser();
    if (user && user.id) {
      this.userId = user.id;
    }

    // Cargar antecedentes existentes si hay
    this.userService.user$.subscribe(userData => {
      const user = Array.isArray(userData) ? userData[0] : userData;
      
      if (user && user.health) {
        // Cargar antecedentes médicos personales
        if (user.health.medical_history && user.health.medical_history.length > 0) {
          // Limpiar el formArray primero
          while (this.medicalHistoryArray.length) {
            this.medicalHistoryArray.removeAt(0);
          }
          
          // Añadir cada antecedente médico existente
          user.health.medical_history.forEach((history: MedicalHistory) => {
            this.medicalHistoryArray.push(this.createMedicalHistoryGroup(history));
          });
        } else {
          // Si no hay antecedentes médicos, añadir un formulario en blanco
          this.addMedicalHistory();
        }
        
        // Cargar antecedentes familiares
        if (user.health.family_history && user.health.family_history.length > 0) {
          // Limpiar el formArray primero
          while (this.familyHistoryArray.length) {
            this.familyHistoryArray.removeAt(0);
          }
          
          // Añadir cada antecedente familiar existente
          user.health.family_history.forEach((history: FamilyHistory) => {
            this.familyHistoryArray.push(this.createFamilyHistoryGroup(history));
          });
        } else {
          // Si no hay antecedentes familiares, añadir un formulario en blanco
          this.addFamilyHistory();
        }
      } else {
        // Si no hay datos de salud, añadir formularios en blanco
        this.addMedicalHistory();
        this.addFamilyHistory();
      }
    });
  }

  // Getters para los FormArrays
  get medicalHistoryArray(): FormArray {
    return this.healthHistoryForm.get('medicalHistory') as FormArray;
  }
  
  get familyHistoryArray(): FormArray {
    return this.healthHistoryForm.get('familyHistory') as FormArray;
  }

  // Creadores de grupos de formularios
  createMedicalHistoryGroup(history?: MedicalHistory): FormGroup {
    return this.fb.group({
      history_type: [history?.history_type || '', Validators.required],
      description: [history?.description || '', Validators.required],
      history_date: [
        history?.history_date 
          ? (history.history_date instanceof Date 
              ? history.history_date.toISOString().slice(0, 10) 
              : new Date(history.history_date).toISOString().slice(0, 10))
          : '', 
        Validators.required
      ]
    });
  }
  
  createFamilyHistoryGroup(history?: FamilyHistory): FormGroup {
    return this.fb.group({
      history_type: [history?.history_type || '', Validators.required],
      relationship: [history?.relationship || '', Validators.required],
      description: [history?.description || '', Validators.required],
      history_date: [
        history?.history_date 
          ? (history.history_date instanceof Date 
              ? history.history_date.toISOString().slice(0, 10) 
              : new Date(history.history_date).toISOString().slice(0, 10))
          : '', 
        Validators.required
      ]
    });
  }

  // Métodos para añadir/remover elementos
  addMedicalHistory(): void {
    this.medicalHistoryArray.push(this.createMedicalHistoryGroup());
  }
  
  removeMedicalHistory(index: number): void {
    this.medicalHistoryArray.removeAt(index);
  }
  
  addFamilyHistory(): void {
    this.familyHistoryArray.push(this.createFamilyHistoryGroup());
  }
  
  removeFamilyHistory(index: number): void {
    this.familyHistoryArray.removeAt(index);
  }

  // Método para guardar
  async saveHealthHistory(): Promise<void> {
    if (this.healthHistoryForm.invalid) {
      this.markFormGroupTouched(this.healthHistoryForm);
      return;
    }

    if (!this.userId) {
      await this.presentToast('Error: No se pudo obtener el ID del usuario', 'danger');
      return;
    }

    this.isSubmitting = true;

    // Preparar los datos para enviar
    const formData = this.healthHistoryForm.value;
    const medicalHistory = formData.medicalHistory.map((history: any) => ({
      ...history,
      user_id: this.userId
    }));
    
    const familyHistory = formData.familyHistory.map((history: any) => ({
      ...history,
      user_id: this.userId
    }));

    this.userHealthService.saveMedicalAndFamilyHistory({ medicalHistory, familyHistory }).subscribe({
      next: async () => {
        this.isSubmitting = false;
        await this.presentToast('Antecedentes guardados correctamente', 'success');
      },
      error: async (error) => {
        console.error('Error al guardar antecedentes:', error);
        this.isSubmitting = false;
        await this.presentToast('Error al guardar los antecedentes', 'danger');
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private async presentToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  getControl(group: AbstractControl, name: string): FormControl {
    return group.get(name) as FormControl;
  }

}