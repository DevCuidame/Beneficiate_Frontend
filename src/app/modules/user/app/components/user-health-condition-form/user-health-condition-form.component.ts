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
  selector: 'app-user-health-condition-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './user-health-condition-form.component.html',
  styleUrls: ['./user-health-condition-form.component.scss'],
})
export class UserHealthConditionFormComponent implements OnInit {
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
      diseases: this.fb.array([]),
      disabilities: this.fb.array([]),
      distinctives: this.fb.array([]),
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
      'diseases',
      this.fb.array(
        this.user.health.diseases?.map((d: any) =>
          this.fb.group({
            id: d.id,
            user_id: this.user?.id,
            disease: [d.disease, [Validators.required]],
            diagnosed_date: [d.diagnosed_date, [Validators.required]],
          })
        ) || []
      )
    );

    this.form.setControl(
      'disabilities',
      this.fb.array(
        this.user.health.disabilities?.map((d: any) =>
          this.fb.group({
            id: d.id,
            user_id: this.user?.id,
            name: [d.name, [Validators.required]],
          })
        ) || []
      )
    );

    this.form.setControl(
      'distinctives',
      this.fb.array(
        this.user.health.distinctives?.map((d: any) =>
          this.fb.group({
            id: d.id,
            user_id: this.user?.id,
            description: [d.description, [Validators.required]],
          })
        ) || []
      )
    );

    // If no existing data, add empty form groups
    if (this.diseases.length === 0) {
      this.addDisease();
    }

    if (this.disabilities.length === 0) {
      this.addDisability();
    }

    if (this.distinctives.length === 0) {
      this.addDistinctive();
    }
  }

  isFormValid(): boolean {
    return (
      (this.diseases.length > 0 && this.diseases.valid) ||
      (this.disabilities.length > 0 && this.disabilities.valid) ||
      (this.distinctives.length > 0 && this.distinctives.valid)
    );
  }

  get diseases(): FormArray {
    return this.form.get('diseases') as FormArray;
  }

  get disabilities(): FormArray {
    return this.form.get('disabilities') as FormArray;
  }

  get distinctives(): FormArray {
    return this.form.get('distinctives') as FormArray;
  }

  getDiseaseFormGroup(index: number): FormGroup {
    return this.diseases.at(index) as FormGroup;
  }

  getDisabilityFormGroup(index: number): FormGroup {
    return this.disabilities.at(index) as FormGroup;
  }

  getDistinctiveFormGroup(index: number): FormGroup {
    return this.distinctives.at(index) as FormGroup;
  }

  getFormControl(formGroup: FormGroup, fieldName: string): FormControl {
    return formGroup.get(fieldName) as FormControl;
  }

  newDisease(): FormGroup {
    return this.fb.group({
      user_id: this.user?.id,
      disease: ['', [Validators.required]],
      diagnosed_date: ['', [Validators.required]],
      treatment_required: [false],
    });
  }

  newDisability(): FormGroup {
    return this.fb.group({
      user_id: this.user?.id,
      name: ['', [Validators.required]],
    });
  }

  newDistinctive(): FormGroup {
    return this.fb.group({
      user_id: this.user?.id,
      description: ['', [Validators.required]],
    });
  }

  addDisease() {
    this.diseases.push(this.newDisease());
    this.form.updateValueAndValidity();
  }

  removeDisease(index: number) {
    this.diseases.removeAt(index);
    this.form.updateValueAndValidity();
  }

  addDisability() {
    this.disabilities.push(this.newDisability());
    this.form.updateValueAndValidity();
  }

  removeDisability(index: number) {
    this.disabilities.removeAt(index);
    this.form.updateValueAndValidity();
  }

  addDistinctive() {
    this.distinctives.push(this.newDistinctive());
    this.form.updateValueAndValidity();
  }

  removeDistinctive(index: number) {
    this.distinctives.removeAt(index);
    this.form.updateValueAndValidity();
  }

  async submitForm() {
    if (this.form.valid && this.user) {
      const payload = {
        user_id: this.user.id,
        diseases: this.form.value.diseases,
        disabilities: this.form.value.disabilities,
        distinctives: this.form.value.distinctives,
      };
      console.log(
        '🚀 ~ UserHealthConditionFormComponent ~ submitForm ~ payload:',
        payload
      );

      this.userHealthService.saveHealthData(payload).subscribe(
        async (response) => {
          if (response.statusCode === 200)
            await this.toastService.presentToast(
              'Información de salud guardada correctamente',
              'success'
            );
          this.navCtrl.navigateRoot('/user/home/conditions');
        },
        async (error) => {
          console.error('Error saving health conditions:', error);
          await this.toastService.presentToast(
            'Error al guardar la información de salud',
            'danger'
          );
        }
      );
    }
  }
}
