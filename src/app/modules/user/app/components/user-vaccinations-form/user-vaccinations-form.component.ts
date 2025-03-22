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
import { Vaccination } from 'src/app/core/interfaces/beneficiary.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { UserHealthService } from 'src/app/core/services/user-health.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';

@Component({
  selector: 'app-user-vaccinations-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './user-vaccinations-form.component.html',
  styleUrls: ['./user-vaccinations-form.component.scss'],
})
export class UserVaccinationsFormComponent implements OnInit {
  public user: User | null = null;
  public buttonBackground: string = 'assets/background/secondary_button_bg.svg';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private userHealthService: UserHealthService,
    private navCtrl: NavController,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      vaccinations: this.fb.array([]),
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

    // Reset the vaccinations array
    this.form.setControl('vaccinations', this.fb.array([]));

    // If the user has vaccinations, load them
    if (this.user.health.vaccinations?.length) {
      const vaccinationsArray = this.fb.array(
        this.user.health.vaccinations.map((v: any) =>
          this.fb.group({
            id: v.id,
            user_id: this.user?.id,
            vaccine: [v.vaccine, [Validators.required]],
            vaccination_date: [
              v.vaccination_date instanceof Date
                ? v.vaccination_date.toISOString().slice(0, 10)
                : v.vaccination_date,
              [Validators.required],
            ],
          })
        )
      );
      this.form.setControl('vaccinations', vaccinationsArray);
    }

    // If no data exists, add empty form group
    if (this.vaccinations.length === 0) {
      this.addVaccination();
    }
  }

  isFormValid(): boolean {
    return this.vaccinations.length > 0 && this.vaccinations.valid;
  }

  get vaccinations(): FormArray {
    return this.form.get('vaccinations') as FormArray;
  }

  getVaccinationFormGroup(index: number): FormGroup {
    return this.vaccinations.at(index) as FormGroup;
  }

  getFormControl(formGroup: FormGroup, fieldName: string): FormControl {
    return formGroup.get(fieldName) as FormControl;
  }

  newVaccination(): FormGroup {
    return this.fb.group({
      user_id: this.user?.id,
      vaccine: ['', [Validators.required]],
      vaccination_date: ['', [Validators.required]],
    });
  }

  addVaccination() {
    this.vaccinations.push(this.newVaccination());
    this.form.updateValueAndValidity();
  }

  removeVaccination(index: number) {
    this.vaccinations.removeAt(index);
    this.form.updateValueAndValidity();
  }

  async submitForm() {
    if (this.form.valid && this.user) {
      const payload = {
        user_id: this.user.id,
        vaccinations: this.form.value.vaccinations,
      };
      console.log("🚀 ~ UserVaccinationsFormComponent ~ submitForm ~ payload:", payload)

      this.userHealthService.saveVaccinations(payload).subscribe(
        async (response) => {
         if(response.statusCode === 200)
          await this.toastService.presentToast(
            'Vacunas guardadas correctamente',
            'success'
          );
          this.navCtrl.navigateRoot('/user/home/vaccinations');
        },
        async (error) => {
          console.error('Error al guardar las vacunas:', error);
          await this.toastService.presentToast(
            'Error al guardar las vacunas',
            'danger'
          );
        }
      );
    }
  }
}
