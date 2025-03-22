import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CustomInputComponent } from 'src/app/pages/components/inputs/custom-input/custom-input.component';
import { UserHealthService } from 'src/app/core/services/user-health.service';
import { Vaccination } from 'src/app/core/interfaces/beneficiary.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';

@Component({
  selector: 'app-user-vacinations-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    CustomInputComponent
  ],
  templateUrl: './user-vacinations-form.component.html',
  styleUrls: ['./user-vacinations-form.component.scss']
})
export class UserVacinationsFormComponent implements OnInit {
  vaccinationsForm: FormGroup;
  isSubmitting = false;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private userHealthService: UserHealthService,
    private userService: UserService,
    private toastCtrl: ToastController
  ) {
    this.vaccinationsForm = this.fb.group({
      vaccinations: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Obtener el ID del usuario
    const user = this.userService.getUser();
    if (user && user.id) {
      this.userId = user.id;
    }

    // Cargar vacunas existentes si hay
    this.userService.user$.subscribe(userData => {
      const user = Array.isArray(userData) ? userData[0] : userData;
      
      if (user && user.health && user.health.vaccinations && user.health.vaccinations.length > 0) {
        // Limpiar el formArray primero
        while (this.vaccinationsArray.length) {
          this.vaccinationsArray.removeAt(0);
        }
        
        // Añadir cada vacuna existente
        user.health.vaccinations.forEach((vaccination: Vaccination) => {
          this.vaccinationsArray.push(this.createVaccinationGroup(vaccination));
        });
      } else {
        // Si no hay vacunas, añadir un formulario en blanco
        this.addVaccination();
      }
    });
  }

  get vaccinationsArray(): FormArray {
    return this.vaccinationsForm.get('vaccinations') as FormArray;
  }

  createVaccinationGroup(vaccination?: Vaccination): FormGroup {
    return this.fb.group({
      vaccine: [vaccination?.vaccine || '', Validators.required],
      vaccination_date: [
        vaccination?.vaccination_date 
          ? (vaccination.vaccination_date instanceof Date 
              ? vaccination.vaccination_date.toISOString().slice(0, 10) 
              : new Date(vaccination.vaccination_date).toISOString().slice(0, 10))
          : '', 
        Validators.required
      ]
    });
  }

  addVaccination(): void {
    this.vaccinationsArray.push(this.createVaccinationGroup());
  }

  removeVaccination(index: number): void {
    this.vaccinationsArray.removeAt(index);
  }

  async saveVaccinations(): Promise<void> {
    if (this.vaccinationsForm.invalid) {
      this.markFormGroupTouched(this.vaccinationsForm);
      return;
    }

    if (!this.userId) {
      await this.presentToast('Error: No se pudo obtener el ID del usuario', 'danger');
      return;
    }

    this.isSubmitting = true;

    // Preparar los datos para enviar
    const formData = this.vaccinationsForm.value;
    const vaccinations = formData.vaccinations.map((vaccination: any) => ({
      ...vaccination,
      user_id: this.userId
    }));

    this.userHealthService.saveVaccinations(vaccinations).subscribe({
      next: async () => {
        this.isSubmitting = false;
        await this.presentToast('Vacunas guardadas correctamente', 'success');
      },
      error: async (error) => {
        console.error('Error al guardar vacunas:', error);
        this.isSubmitting = false;
        await this.presentToast('Error al guardar las vacunas', 'danger');
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