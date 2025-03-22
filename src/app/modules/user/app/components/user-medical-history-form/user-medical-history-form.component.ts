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
import { historyTypeOptions, relativeOptions } from 'src/app/core/constants/options';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { UserHealthService } from 'src/app/core/services/user-health.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';

@Component({
  selector: 'app-user-medical-history-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './user-medical-history-form.component.html',
  styleUrls: ['./user-medical-history-form.component.scss'],
})
export class UserMedicalHistoryFormComponent implements OnInit {
  public user: User | null = null;
  public buttonBackground: string = 'assets/background/secondary_button_bg.svg';

  public relativeOptions = relativeOptions;
  public historyTypeOptions = historyTypeOptions;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private userHealthService: UserHealthService,
    private navCtrl: NavController,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      medicalHistory: this.fb.array([]),
      familyHistory: this.fb.array([]),
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

    this.form.setControl(
      'medicalHistory',
      this.fb.array(
        this.user.health.medical_history?.map((m: any) =>
          this.fb.group({
            id: m.id,
            user_id: this.user?.id,
            history_type: [m.history_type, [Validators.required]],
            description: [m.description, [Validators.required]],
            history_date: [
              m.history_date instanceof Date
                ? m.history_date.toISOString().slice(0, 10)
                : m.history_date,
              [Validators.required],
            ],
          })
        ) || []
      )
    );

    this.form.setControl(
      'familyHistory',
      this.fb.array(
        this.user.health.family_history?.map((f: any) =>
          this.fb.group({
            id: f.id,
            user_id: this.user?.id,
            history_type: [f.history_type, [Validators.required]],
            relationship: [f.relationship, [Validators.required]],
            description: [f.description, [Validators.required]],
            history_date: [
              f.history_date instanceof Date
                ? f.history_date.toISOString().slice(0, 10)
                : f.history_date,
              [Validators.required],
            ],
          })
        ) || []
      )
    );
    
    // If no existing data, add empty form groups
    if (this.medicalHistory.length === 0) {
      this.addMedicalHistory();
    }
    
    if (this.familyHistory.length === 0) {
      this.addFamilyHistory();
    }
  }

  isFormValid(): boolean {
    return (
      (this.familyHistory.length > 0 && this.familyHistory.valid) ||
      (this.medicalHistory.length > 0 && this.medicalHistory.valid)
    );
  }
  
  get medicalHistory(): FormArray {
    return this.form.get('medicalHistory') as FormArray;
  }

  get familyHistory(): FormArray {
    return this.form.get('familyHistory') as FormArray;
  }

  getMedicalHistoryFormGroup(index: number): FormGroup {
    return this.medicalHistory.at(index) as FormGroup;
  }

  getFamilyHistoryFormGroup(index: number): FormGroup {
    return this.familyHistory.at(index) as FormGroup;
  }

  getFormControl(formGroup: FormGroup, fieldName: string): FormControl {
    return formGroup.get(fieldName) as FormControl;
  }

  newMedicalHistory(): FormGroup {
    return this.fb.group({
      user_id: this.user?.id,
      history_type: ['', [Validators.required]],
      description: ['', [Validators.required]],
      history_date: ['', [Validators.required]],
    });
  }

  newFamilyHistory(): FormGroup {
    return this.fb.group({
      user_id: this.user?.id,
      history_type: ['', [Validators.required]],
      relationship: ['', [Validators.required]],
      description: ['', [Validators.required]],
      history_date: ['', [Validators.required]],
    });
  }

  addMedicalHistory() {
    this.medicalHistory.push(this.newMedicalHistory());
    this.form.updateValueAndValidity();
  }

  removeMedicalHistory(index: number) {
      this.medicalHistory.removeAt(index);
      this.form.updateValueAndValidity();
  }

  addFamilyHistory() {
    this.familyHistory.push(this.newFamilyHistory());
    this.form.updateValueAndValidity();
  }

  removeFamilyHistory(index: number) {
      this.familyHistory.removeAt(index);
      this.form.updateValueAndValidity();
  }

  async submitForm() {
    if (this.form.valid && this.user) {
      const payload = {
        user_id: this.user.id,
        medicalHistory: this.form.value.medicalHistory,
        familyHistory: this.form.value.familyHistory,
      };

      this.userHealthService.saveMedicalAndFamilyHistory(payload).subscribe(
        async (response) => {
         if(response.statusCode === 200)

          await this.toastService.presentToast(
            'Información de antecedentes guardada correctamente',
            'success'
          );
          this.navCtrl.navigateRoot('/user/home/medical-history');
        },
        async (error) => {
          console.error('Error al guardar los antecedentes:', error);
          await this.toastService.presentToast(
            'Error al guardar la información de antecedentes',
            'danger'
          );
        }
      );
    }
  }
}