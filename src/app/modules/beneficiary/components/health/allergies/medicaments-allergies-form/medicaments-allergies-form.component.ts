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
  selector: 'app-medicaments-allergies-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './medicaments-allergies-form.component.html',
  styleUrls: ['./medicaments-allergies-form.component.scss'],
})
export class MedicamentsAllergiesFormComponent implements OnInit {
  public activeBeneficiary: Beneficiary | null = null;
  public buttonBackground: string = 'assets/background/secondary_button_bg.svg';

  form: FormGroup;

  severityOptions = [
    { value: 'MILD', label: 'Leve' },
    { value: 'MODERATE', label: 'Moderada' },
    { value: 'SEVERE', label: 'Grave' },
  ];

  constructor(
    private fb: FormBuilder,
    private beneficiaryService: BeneficiaryService,
    private healthDataService: HealthDataService,
    private navCtrL: NavController,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      medications: this.fb.array([]),
      allergies: this.fb.array([]),
    });

    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;
      this.initializeForm();
    });

    this.addMedication();
    this.addAllergy();
  }

  ngOnInit() {}

  initializeForm() {
    if (!this.activeBeneficiary) return;

    this.form.setControl(
      'medications',
      this.fb.array(
        this.activeBeneficiary.medications?.map((m) =>
          this.fb.group({
            id: m.id,
            beneficiary_id: this.activeBeneficiary?.id,
            medication: [
              m.medication,
              [Validators.required, Validators.minLength(3)],
            ],
            laboratory: [m.laboratory, [Validators.required]],
            prescription: [m.prescription, [Validators.required]],
            dosage: [m.dosage, [Validators.required]],
            frequency: [m.frequency, [Validators.required]],
          })
        ) || []
      )
    );

    this.form.setControl(
      'allergies',
      this.fb.array(
        this.activeBeneficiary.allergies?.map((a) =>
          this.fb.group({
            id: a.id,
            beneficiary_id: this.activeBeneficiary?.id,
            allergy_type: [a.allergy_type, [Validators.required]],
            description: [a.description, [Validators.required]],
            severity: [a.severity, [Validators.required]],
          })
        ) || []
      )
    );
  }

  isFormValid(): boolean {
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
      beneficiary_id: this.activeBeneficiary?.id,
      medication: ['', [Validators.required, Validators.minLength(3)]],
      laboratory: ['', [Validators.required]],
      prescription: ['', [Validators.required]],
      dosage: ['', [Validators.required]],
      frequency: ['', [Validators.required]],
    });
  }

  newAllergy(): FormGroup {
    return this.fb.group({
      beneficiary_id: this.activeBeneficiary?.id,
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
    if (this.form.valid && this.activeBeneficiary) {
      const payload = {
        allergies: this.form.value.allergies,
        medications: this.form.value.medications,
      };

      this.healthDataService.saveAllergiesAndMedications(payload).subscribe(
        async (response) => {
          if (
            response.data?.allergies?.length ||
            response.data?.medications?.length
          ) {
            const updatedAllergies = response.data.allergies || [];
            const updatedMedications = response.data.medications || [];

            if (!this.activeBeneficiary?.id) {
              return;
            }

            const updatedActiveBeneficiary = {
              ...this.activeBeneficiary,
              allergies: updatedAllergies,
              medications: updatedMedications,
            };

            this.beneficiaryService.setActiveBeneficiary(
              updatedActiveBeneficiary
            );

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
          this.navCtrL.navigateRoot('/beneficiary/home/medicaments-allergies');
        },
        async (error) => {
          await this.toastService.presentToast(error.data.message, 'danger');
        }
      );
    }
  }
}
