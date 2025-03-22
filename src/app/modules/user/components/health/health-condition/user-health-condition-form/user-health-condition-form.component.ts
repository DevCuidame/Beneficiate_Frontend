import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CustomInputComponent } from 'src/app/pages/components/inputs/custom-input/custom-input.component';
import { UserHealthService } from 'src/app/core/services/user-health.service';
import { Disease, Disability, Distinctive } from 'src/app/core/interfaces/beneficiary.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';

@Component({
  selector: 'app-user-health-condition-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    CustomInputComponent
  ],
  templateUrl: './user-health-condition-form.component.html',
  styleUrls: ['./user-health-condition-form.component.scss']
})
export class UserHealthConditionFormComponent implements OnInit {
  healthConditionForm: FormGroup;
  isSubmitting = false;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private userHealthService: UserHealthService,
    private userService: UserService,
    private toastCtrl: ToastController
  ) {
    this.healthConditionForm = this.fb.group({
      diseases: this.fb.array([]),
      disabilities: this.fb.array([]),
      distinctives: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Obtener el ID del usuario
    const user = this.userService.getUser();
    if (user && user.id) {
      this.userId = user.id;
    }

    // Cargar condiciones existentes si hay
    this.userService.user$.subscribe(userData => {
      const user = Array.isArray(userData) ? userData[0] : userData;
      
      if (user && user.health) {
        // Cargar enfermedades
        if (user.health.diseases && user.health.diseases.length > 0) {
          while (this.diseasesArray.length) {
            this.diseasesArray.removeAt(0);
          }
          
          user.health.diseases.forEach((disease: Disease) => {
            this.diseasesArray.push(this.createDiseaseGroup(disease));
          });
        } else {
          this.addDisease();
        }
        
        // Cargar discapacidades
        if (user.health.disabilities && user.health.disabilities.length > 0) {
          while (this.disabilitiesArray.length) {
            this.disabilitiesArray.removeAt(0);
          }
          
          user.health.disabilities.forEach((disability: Disability) => {
            this.disabilitiesArray.push(this.createDisabilityGroup(disability));
          });
        } else {
          this.addDisability();
        }
        
        // Cargar distintivos
        if (user.health.distinctives && user.health.distinctives.length > 0) {
          while (this.distinctivesArray.length) {
            this.distinctivesArray.removeAt(0);
          }
          
          user.health.distinctives.forEach((distinctive: Distinctive) => {
            this.distinctivesArray.push(this.createDistinctiveGroup(distinctive));
          });
        } else {
          this.addDistinctive();
        }
      } else {
        // Si no hay datos de salud, añadir formularios en blanco
        this.addDisease();
        this.addDisability();
        this.addDistinctive();
      }
    });
  }

  // Getters para los FormArrays
  get diseasesArray(): FormArray {
    return this.healthConditionForm.get('diseases') as FormArray;
  }
  
  get disabilitiesArray(): FormArray {
    return this.healthConditionForm.get('disabilities') as FormArray;
  }
  
  get distinctivesArray(): FormArray {
    return this.healthConditionForm.get('distinctives') as FormArray;
  }

  // Creadores de grupos de formularios
  createDiseaseGroup(disease?: Disease): FormGroup {
    return this.fb.group({
      disease: [disease?.disease || '', Validators.required],
      diagnosed_date: [
        disease?.diagnosed_date 
          ? (disease.diagnosed_date instanceof Date 
              ? disease.diagnosed_date.toISOString().slice(0, 10) 
              : new Date(disease.diagnosed_date).toISOString().slice(0, 10))
          : '', 
        Validators.required
      ],
      treatment_required: [disease?.treatment_required ?? false]
    });
  }
  
  createDisabilityGroup(disability?: Disability): FormGroup {
    return this.fb.group({
      name: [disability?.name || '', Validators.required]
    });
  }
  
  createDistinctiveGroup(distinctive?: Distinctive): FormGroup {
    return this.fb.group({
      description: [distinctive?.description || '', Validators.required]
    });
  }

  // Métodos para añadir/remover elementos
  addDisease(): void {
    this.diseasesArray.push(this.createDiseaseGroup());
  }
  
  removeDisease(index: number): void {
    this.diseasesArray.removeAt(index);
  }
  
  addDisability(): void {
    this.disabilitiesArray.push(this.createDisabilityGroup());
  }
  
  removeDisability(index: number): void {
    this.disabilitiesArray.removeAt(index);
  }
  
  addDistinctive(): void {
    this.distinctivesArray.push(this.createDistinctiveGroup());
  }
  
  removeDistinctive(index: number): void {
    this.distinctivesArray.removeAt(index);
  }

  // Método para guardar
  async saveHealthCondition(): Promise<void> {
    if (this.healthConditionForm.invalid) {
      this.markFormGroupTouched(this.healthConditionForm);
      return;
    }

    if (!this.userId) {
      await this.presentToast('Error: No se pudo obtener el ID del usuario', 'danger');
      return;
    }

    this.isSubmitting = true;

    // Preparar los datos para enviar
    const formData = this.healthConditionForm.value;
    const diseases = formData.diseases.map((disease: any) => ({
      ...disease,
      user_id: this.userId
    }));
    
    const disabilities = formData.disabilities.map((disability: any) => ({
      ...disability,
      user_id: this.userId
    }));
    
    const distinctives = formData.distinctives.map((distinctive: any) => ({
      ...distinctive,
      user_id: this.userId
    }));

    this.userHealthService.saveHealthData({ diseases, disabilities, distinctives }).subscribe({
      next: async () => {
        this.isSubmitting = false;
        await this.presentToast('Condiciones de salud guardadas correctamente', 'success');
      },
      error: async (error) => {
        console.error('Error al guardar condiciones de salud:', error);
        this.isSubmitting = false;
        await this.presentToast('Error al guardar las condiciones de salud', 'danger');
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