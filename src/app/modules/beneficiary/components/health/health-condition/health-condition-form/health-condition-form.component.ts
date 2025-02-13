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
    private healthDataService: HealthDataService
  ) {
    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;
    });
    this.form = this.fb.group({
      diseases: this.fb.array([]),
      disabilities: this.fb.array([]),
      distinctives: this.fb.array([]),
    });

    this.addDisease();
    this.addDisability();
    this.addDistinctive();
  }

  ngOnInit() {}

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
  }

  removeDisease(index: number) {
    if (this.diseases.length > 1) {
      this.diseases.removeAt(index);
    }
  }

  addDisability() {
    this.disabilities.push(this.newDisability());
  }

  removeDisability(index: number) {
    if (this.disabilities.length > 1) {
      this.disabilities.removeAt(index);
    }
  }

  addDistinctive() {
    this.distinctives.push(this.newDistinctive());
  }

  removeDistinctive(index: number) {
    if (this.distinctives.length > 1) {
      this.distinctives.removeAt(index);
    }
  }

  getFormControl(formGroup: FormGroup, fieldName: string): FormControl {
    return formGroup.get(fieldName) as FormControl;
  }

  submitForm() {
    if (this.form.valid && this.activeBeneficiary) {
      const payload = {
        diseases: this.form.value.diseases,
        disabilities: this.form.value.disabilities,
        distinctives: this.form.value.distinctives
      };
      console.log("🚀 ~ HealthConditionFormComponent ~ submitForm ~ payload:", payload)
  
      this.healthDataService.saveHealthData(payload).subscribe(
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
