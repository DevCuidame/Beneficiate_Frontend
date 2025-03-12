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
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { HealthDataService } from 'src/app/core/services/healthData.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';

@Component({
  selector: 'app-health-condition-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './health-condition-form.component.html',
  styleUrls: ['./health-condition-form.component.scss'],
})
export class HealthConditionFormComponent implements OnInit {
  public activeBeneficiary: Beneficiary | null = null;
  public buttonBackground: string = 'assets/background/secondary_button_bg.svg';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private beneficiaryService: BeneficiaryService,
    private healthDataService: HealthDataService,
    private navCtrL: NavController,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      diseases: this.fb.array([]),
      disabilities: this.fb.array([]),
      distinctives: this.fb.array([]),
    });

    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;
      this.initializeForm();
    });

  }

  ngOnInit() {}

  initializeForm() {
    if (!this.activeBeneficiary) return;

    this.form.setControl(
      'diseases',
      this.fb.array(
        this.activeBeneficiary.diseases?.map((d) =>
          this.fb.group({
            id: d.id,
            beneficiary_id: this.activeBeneficiary?.id,
            disease: [d.disease, [Validators.required]],
            diagnosed_date: [d.diagnosed_date, [Validators.required]],
            treatment_required: [d.treatment_required, [Validators.required]],
          })
        ) || []
      )
    );

    this.form.setControl(
      'disabilities',
      this.fb.array(
        this.activeBeneficiary.disabilities?.map((d) =>
          this.fb.group({
            id: d.id,
            beneficiary_id: this.activeBeneficiary?.id,
            name: [d.name, [Validators.required]],
          })
        ) || []
      )
    );

    this.form.setControl(
      'distinctives',
      this.fb.array(
        this.activeBeneficiary.distinctives?.map((d) =>
          this.fb.group({
            id: d.id,
            beneficiary_id: this.activeBeneficiary?.id,
            description: [d.description, [Validators.required]],
          })
        ) || []
      )
    );
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
      beneficiary_id: this.activeBeneficiary?.id,
      disease: ['', [Validators.required]],
      diagnosed_date: ['', [Validators.required]],
      treatment_required: [false, [Validators.required]],
    });
  }

  newDisability(): FormGroup {
    return this.fb.group({
      beneficiary_id: this.activeBeneficiary?.id,
      name: ['', [Validators.required]],
    });
  }

  newDistinctive(): FormGroup {
    return this.fb.group({
      beneficiary_id: this.activeBeneficiary?.id,
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
    if (this.form.valid && this.activeBeneficiary) {
      const payload = {
        diseases: this.form.value.diseases,
        disabilities: this.form.value.disabilities,
        distinctives: this.form.value.distinctives,
      };

      this.healthDataService.saveHealthData(payload).subscribe(
        async (response) => {
          if (
            response.data?.diseases?.length ||
            response.data?.disabilities?.length ||
            response.data?.distinctives?.length
          ) {
            const updatedDiseases = response.data.diseases || [];
            const updatedDisabilities = response.data.disabilities || [];
            const updatedDistinctives = response.data.distinctives || [];

            if (!this.activeBeneficiary?.id) {
              return;
            }

            const updatedActiveBeneficiary = {
              ...this.activeBeneficiary,
              diseases: updatedDiseases,
              disabilities: updatedDisabilities,
              distinctives: updatedDistinctives,
            };

            this.beneficiaryService.setActiveBeneficiary({
              ...updatedActiveBeneficiary,
            });

            const updatedBeneficiaries = this.beneficiaryService
              .getBeneficiaries()
              .map((b) =>
                b.id === updatedActiveBeneficiary.id
                  ? updatedActiveBeneficiary
                  : b
              );

            this.beneficiaryService.setBeneficiaries(updatedBeneficiaries);
          }

          await this.toastService.presentToast(
            response.data.message,
            'success'
          );
          this.navCtrL.navigateRoot('/beneficiary/home/conditions');
        },
        async (error) => {
          await this.toastService.presentToast(error.data.message, 'danger');
        }
      );
    }
  }
}
