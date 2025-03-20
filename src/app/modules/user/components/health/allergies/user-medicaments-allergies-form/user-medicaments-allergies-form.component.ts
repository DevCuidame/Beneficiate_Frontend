import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CustomInputComponent } from 'src/app/pages/components/inputs/custom-input/custom-input.component';
import { UserHealthService } from 'src/app/core/services/user-health.service';
import {
  Allergy,
  Medication,
} from 'src/app/core/interfaces/beneficiary.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';

@Component({
  selector: 'app-user-medicaments-allergies-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    CustomInputComponent,
  ],
  templateUrl: './user-medicaments-allergies-form.component.html',
  styleUrls: ['./user-medicaments-allergies-form.component.scss'],
})
export class UserMedicamentsAllergiesFormComponent implements OnInit {
  medicationsAllergiesForm: FormGroup;
  isSubmitting = false;
  userId: number | null = null;

  severityOptions = [
    { value: 'MILD', label: 'Leve' },
    { value: 'MODERATE', label: 'Moderado' },
    { value: 'SEVERE', label: 'Severo' },
  ];

  constructor(
    private fb: FormBuilder,
    private userHealthService: UserHealthService,
    private userService: UserService,
    private toastCtrl: ToastController
  ) {
    this.medicationsAllergiesForm = this.fb.group({
      medications: this.fb.array([]),
      allergies: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    // Obtener el ID del usuario
    const user = this.userService.getUser();
    if (user && user.id) {
      this.userId = user.id;
    }

    // Cargar datos existentes si hay
    this.userService.user$.subscribe((userData) => {
      const user = Array.isArray(userData) ? userData[0] : userData;

      if (user && user.health) {
        // Cargar medicamentos
        if (user.health.medications && user.health.medications.length > 0) {
          while (this.medicationsArray.length) {
            this.medicationsArray.removeAt(0);
          }

          user.health.medications.forEach((medication: Medication) => {
            this.medicationsArray.push(this.createMedicationGroup(medication));
          });
        } else {
          this.addMedication();
        }

        // Cargar alergias
        if (user.health.allergies && user.health.allergies.length > 0) {
          while (this.allergiesArray.length) {
            this.allergiesArray.removeAt(0);
          }

          user.health.allergies.forEach((allergy: Allergy) => {
            this.allergiesArray.push(this.createAllergyGroup(allergy));
          });
        } else {
          this.addAllergy();
        }
      } else {
        // Si no hay datos de salud, añadir formularios en blanco
        this.addMedication();
        this.addAllergy();
      }
    });
  }

  // Getters para los FormArrays
  get medicationsArray(): FormArray {
    return this.medicationsAllergiesForm.get('medications') as FormArray;
  }

  get allergiesArray(): FormArray {
    return this.medicationsAllergiesForm.get('allergies') as FormArray;
  }

  // Creadores de grupos de formularios
  createMedicationGroup(medication?: Medication): FormGroup {
    return this.fb.group({
      medication: [medication?.medication || '', Validators.required],
      laboratory: [medication?.laboratory || ''],
      prescription: [medication?.prescription || ''],
      dosage: [medication?.dosage || '', Validators.required],
      frequency: [medication?.frequency || '', Validators.required],
    });
  }

  createAllergyGroup(allergy?: Allergy): FormGroup {
    return this.fb.group({
      allergy_type: [allergy?.allergy_type || '', Validators.required],
      description: [allergy?.description || '', Validators.required],
      severity: [allergy?.severity || 'MILD', Validators.required],
    });
  }

  // Métodos para añadir/remover elementos
  addMedication(): void {
    this.medicationsArray.push(this.createMedicationGroup());
  }

  removeMedication(index: number): void {
    this.medicationsArray.removeAt(index);
  }

  addAllergy(): void {
    this.allergiesArray.push(this.createAllergyGroup());
  }

  removeAllergy(index: number): void {
    this.allergiesArray.removeAt(index);
  }

  // Método para guardar
  async saveMedicationsAllergies(): Promise<void> {
    if (this.medicationsAllergiesForm.invalid) {
      this.markFormGroupTouched(this.medicationsAllergiesForm);
      return;
    }

    if (!this.userId) {
      await this.presentToast(
        'Error: No se pudo obtener el ID del usuario',
        'danger'
      );
      return;
    }

    this.isSubmitting = true;

    // Preparar los datos para enviar
    const formData = this.medicationsAllergiesForm.value;
    const medications = formData.medications.map((medication: any) => ({
      ...medication,
      user_id: this.userId,
    }));

    const allergies = formData.allergies.map((allergy: any) => ({
      ...allergy,
      user_id: this.userId,
    }));

    this.userHealthService
      .saveAllergiesAndMedications({ medications, allergies })
      .subscribe({
        next: async () => {
          this.isSubmitting = false;
          await this.presentToast(
            'Medicamentos y alergias guardados correctamente',
            'success'
          );
        },
        error: async (error) => {
          console.error('Error al guardar medicamentos y alergias:', error);
          this.isSubmitting = false;
          await this.presentToast(
            'Error al guardar los medicamentos y alergias',
            'danger'
          );
        },
      });
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private async presentToast(
    message: string,
    color: 'success' | 'warning' | 'danger'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color,
    });
    await toast.present();
  }

  getControl(group: AbstractControl, name: string): FormControl {
    return group.get(name) as FormControl;
  }
}
