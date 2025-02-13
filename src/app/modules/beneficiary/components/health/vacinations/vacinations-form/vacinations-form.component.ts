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
  selector: 'app-vacinations-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputComponent,
    CustomButtonComponent,
  ],
  templateUrl: './vacinations-form.component.html',
  styleUrls: ['./vacinations-form.component.scss'],
})
export class VacinationsFormComponent implements OnInit {
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
      vaccinations: this.fb.array([]),
    });

    this.addVaccination();
  }

  ngOnInit() {}

  get vaccinations(): FormArray {
    return this.form.get('vaccinations') as FormArray;
  }

  getVaccinationFormGroup(index: number): FormGroup {
    return this.vaccinations.at(index) as FormGroup;
  }

  newVaccination(): FormGroup {
    return this.fb.group({
      beneficiary_id: this.activeBeneficiary?.id,
      vaccine: ['', [Validators.required]],
      vaccination_date: ['', [Validators.required]],
    });
  }

  addVaccination() {
    this.vaccinations.push(this.newVaccination());
  }

  removeVaccination(index: number) {
    if (this.vaccinations.length > 1) {
      this.vaccinations.removeAt(index);
    }
  }

  getFormControl(formGroup: FormGroup, fieldName: string): FormControl {
    return formGroup.get(fieldName) as FormControl;
  }

  submitForm() {
    if (this.form.valid && this.activeBeneficiary) {
      this.healthDataService
        .saveVaccinations(
          this.form.value.vaccinations
        )
        .subscribe(
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
