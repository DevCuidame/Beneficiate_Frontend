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
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { HealthDataService } from 'src/app/core/services/healthData.service';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';

@Component({
  selector: 'app-medical-history-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './medical-history-form.component.html',
  styleUrls: ['./medical-history-form.component.scss'],
})
export class MedicalHistoryFormComponent implements OnInit {
  public activeBeneficiary: Beneficiary | null = null;
  public buttonBackground: string = 'assets/background/secondary_button_bg.svg';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private beneficiaryService: BeneficiaryService,
    private healthDataService: HealthDataService
  ) {
    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;
    });
    this.form = this.fb.group({
      medicalHistory: this.fb.array([]),
      familyHistory: this.fb.array([]),
    });

    this.addMedicalHistory();
    this.addFamilyHistory();
  }

  ngOnInit() {}

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

  newMedicalHistory(): FormGroup {
    return this.fb.group({
      beneficiary_id: this.activeBeneficiary?.id,
      history_type: ['', [Validators.required]],
      description: ['', [Validators.required]],
      history_date: ['', [Validators.required]],
    });
  }

  newFamilyHistory(): FormGroup {
    return this.fb.group({
      beneficiary_id: this.activeBeneficiary?.id,
      history_type: ['', [Validators.required]],
      relationship: ['', [Validators.required]],
      description: ['', [Validators.required]],
      history_date: ['', [Validators.required]],
    });
  }

  addMedicalHistory() {
    this.medicalHistory.push(this.newMedicalHistory());
  }

  removeMedicalHistory(index: number) {
    if (this.medicalHistory.length > 1) {
      this.medicalHistory.removeAt(index);
    }
  }

  addFamilyHistory() {
    this.familyHistory.push(this.newFamilyHistory());
  }

  removeFamilyHistory(index: number) {
    if (this.familyHistory.length > 1) {
      this.familyHistory.removeAt(index);
    }
  }

  getFormControl(formGroup: FormGroup, fieldName: string): FormControl {
    return formGroup.get(fieldName) as FormControl;
  }

  submitForm() {
    if (this.form.valid && this.activeBeneficiary) {
      const payload = {
        medicalHistory: this.form.value.medicalHistory,
        familyHistory: this.form.value.familyHistory
      };
  
      this.healthDataService.saveMedicalAndFamilyHistory(payload).subscribe(
        (response) => {
          console.log('📩 Datos guardados:', response);
        },
        (error) => {
          console.error('Error al guardar:', error);
        }
      );
    }
  }
  
}
