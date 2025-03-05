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
import {
  Beneficiary,
  Vaccination,
} from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { HealthDataService } from 'src/app/core/services/healthData.service';
import { ToastService } from 'src/app/core/services/toast.service';
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
    private healthDataService: HealthDataService,
    private navCtrL: NavController,
    private toastService: ToastService
  ) {
    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;
    });
    this.form = this.fb.group({
      vaccinations: this.fb.array([]),
    });

    this.addVaccination();
  }

  ngOnInit() {
    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;

      if (this.activeBeneficiary?.vaccinations?.length) {
        this.form.setControl(
          'vaccinations',
          this.fb.array(
            this.activeBeneficiary.vaccinations.map((v) =>
              this.fb.group({
                id: v.id,
                beneficiary_id: this.activeBeneficiary?.id,
                vaccine: [v.vaccine, Validators.required],
                vaccination_date: [v.vaccination_date, Validators.required],
              })
            )
          )
        );
      }
    });
  }

  isFormValid(): boolean {
    return (
      (this.vaccinations.length > 0 && this.vaccinations.valid)
    );
  }

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
    this.form.updateValueAndValidity();
  }

  removeVaccination(index: number) {
    this.vaccinations.removeAt(index);this.form.updateValueAndValidity();
    
  }

  getFormControl(formGroup: FormGroup, fieldName: string): FormControl {
    return formGroup.get(fieldName) as FormControl;
  }

  async submitForm() {
    if (this.form.valid && this.activeBeneficiary) {
      this.healthDataService
        .saveVaccinations(this.form.value.vaccinations)
        .subscribe(
          async (response) => {
            if (response.data?.vaccinations?.length) {
              const updatedVaccinations: Vaccination[] =
                response.data.vaccinations;

              if (!this.activeBeneficiary?.id) {
                return;
              }

              const updatedActiveBeneficiary: Beneficiary = {
                ...this.activeBeneficiary,
                id: this.activeBeneficiary.id,
                vaccinations: updatedVaccinations,
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
            this.navCtrL.navigateRoot('/beneficiary/home/conditions');
          },
          async (error) => {
            await this.toastService.presentToast(error.data.message, 'danger');
          }
        );
    }
  }
}
