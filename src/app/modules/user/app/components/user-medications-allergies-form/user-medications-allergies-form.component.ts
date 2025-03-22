import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NavController } from '@ionic/angular';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { UserHealthService } from 'src/app/core/services/user-health.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';

@Component({
  selector: 'app-user-medications-allergies-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './user-medications-allergies-form.component.html',
  styleUrls: ['./user-medications-allergies-form.component.scss'],
})
export class UserMedicationsAllergiesFormComponent implements OnInit {
  public user: User | null = null;
  public buttonBackground: string = 'assets/background/secondary_button_bg.svg';

  form: FormGroup;

  severityOptions = [
    { value: 'MILD', label: 'Leve' },
    { value: 'MODERATE', label: 'Moderada' },
    { value: 'SEVERE', label: 'Grave' },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private userHealthService: UserHealthService,
    private navCtrl: NavController,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      medications: this.fb.array([]),
      allergies: this.fb.array([]),
    });

    this.userService.user$.subscribe((userData) => {
      if (Array.isArray(userData) && userData.length > 0) {
        this.user = userData[0];
      } else {
        this.user = userData;
      }
      this.initializeForm();
    });
  }

  ngOnInit() {}

  initializeForm() {
    if (!this.user || !this.user.health) return;

    // Reset form arrays
    this.form.setControl('medications', this.fb.array([]));
    this.form.setControl('allergies', this.fb.array([]));

    // If the user has medications, load them
    if (this.user.health.medications?.length) {
      const medicationsArray = this.fb.array(
        this.user.health.medications.map((m: any) =>
          this.fb.group({
            id: m.id,
            user_id: this.user?.id,
            medication: [m.medication, [Validators.required, Validators.minLength(3)]],
            laboratory: [m.laboratory, [Validators.required]],
            prescription: [m.prescription, [Validators.required]],
            dosage: [m.dosage, [Validators.required]],
            frequency: [m.frequency, [Validators.required]],
          })
        )
      );
      this.form.setControl('medications', medicationsArray);
    }

    // If the user has allergies, load them
    if (this.user.health.allergies?.length) {
      const allergiesArray = this.fb.array(
        this.user.health.allergies.map((a: any) =>
          this.fb.group({
            id: a.id,
            user_id: this.user?.id,
            allergy_type: [a.allergy_type, [Validators.required]],
            description: [a.description, [Validators.required]],
            severity: [a.severity, [Validators.required]],
          })
        )
      );
      this.form.setControl('allergies', allergiesArray);
    }

    // If no data exists, add empty form groups
    if (this.medications.length === 0) {
      this.addMedication();
    }
    
    if (this.allergies.length === 0) {
      this.addAllergy();
    }
  }

  isFormValid(): boolean {
    // Only validate if there are elements in the arrays
    if (this.medications.length === 0 && this.allergies.length === 0) {
      return false;
    }
    
    return (
      (this.medications.length > 0 && this.medications.valid) ||
      (this.allergies.length > 0 && this.allergies.valid)
    );
  }

  get medications(): FormArray {
    return this.form.get('medications') as FormArray;
  }

  get allergies(): FormArray {
    return this.form.get('allergies') as FormArray;
  }

  getMedicationFormGroup(index: number): FormGroup {
    return this.medications.at(index) as FormGroup;
  }

  getAllergyFormGroup(index: number): FormGroup {
    return this.allergies.at(index) as FormGroup;
  }

  getFormControl(formGroup: FormGroup, fieldName: string): FormControl {
    return formGroup.get(fieldName) as FormControl;
  }

  newMedication(): FormGroup {
    return this.fb.group({
      user_id: this.user?.id,
      medication: ['', [Validators.required, Validators.minLength(3)]],
      laboratory: ['', [Validators.required]],
      prescription: ['', [Validators.required]],
      dosage: ['', [Validators.required]],
      frequency: ['', [Validators.required]],
    });
  }

  newAllergy(): FormGroup {
    return this.fb.group({
      user_id: this.user?.id,
      allergy_type: ['', [Validators.required]],
      description: ['', [Validators.required]],
      severity: ['', [Validators.required]],
    });
  }

  addMedication() {
    this.medications.push(this.newMedication());
    this.form.updateValueAndValidity();
  }

  removeMedication(index: number) {
    this.medications.removeAt(index);
    this.form.updateValueAndValidity();
  }

  addAllergy() {
    this.allergies.push(this.newAllergy());
    this.form.updateValueAndValidity();
  }

  removeAllergy(index: number) {
    this.allergies.removeAt(index);
    this.form.updateValueAndValidity();
  }

  async submitForm() {
    if (this.form.valid && this.user) {
      const payload = {
        user_id: this.user.id,
        allergies: this.form.value.allergies,
        medications: this.form.value.medications,
      };

      this.userHealthService.saveAllergiesAndMedications(payload).subscribe(
        async (response) => {
         if(response.statusCode === 200)
          await this.toastService.presentToast(
            'Medicamentos y alergias guardados correctamente',
            'success'
          );
          this.navCtrl.navigateRoot('/user/home/medicaments-allergies');
        },
        async (error) => {
          console.error('Error al guardar medicamentos y alergias:', error);
          await this.toastService.presentToast(
            'Error al guardar la información',
            'danger'
          );
        }
      );
    }
  }
}