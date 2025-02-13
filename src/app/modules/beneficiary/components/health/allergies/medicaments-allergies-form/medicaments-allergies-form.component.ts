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
import {
  Beneficiary,
} from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { HealthDataService } from 'src/app/core/services/healthData.service';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';
import { InputComponent } from 'src/app/shared/components/input/input.component';

@Component({
  selector: 'app-medicaments-allergies-form',
  imports: [ReactiveFormsModule, CommonModule, InputComponent, CustomButtonComponent],
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

  constructor(private fb: FormBuilder, private beneficiaryService: BeneficiaryService, private healthDataService: HealthDataService) {
    this.beneficiaryService.activeBeneficiary$.subscribe((beneficiary) => {
      this.activeBeneficiary = beneficiary;
    });
    this.form = this.fb.group({
      medications: this.fb.array([]),
      allergies: this.fb.array([]), 
    });

    this.addMedication();
    this.addAllergy();
  }

  ngOnInit() {}

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

  // 🔹 Crear un nuevo medicamento
  newMedication(): FormGroup {
    return this.fb.group({
      beneficiary_id: this.activeBeneficiary?.id,
      medication: ['', [Validators.required, Validators.minLength(3)]],
      laboratory: ['',[Validators.required]],
      prescription: ['',[Validators.required]],
      dosage: ['', [Validators.required]],
      frequency: ['',[Validators.required]],
    });
  }

  // 🔹 Crear una nueva alergia
  newAllergy(): FormGroup {
    return this.fb.group({
      beneficiary_id: this.activeBeneficiary?.id,
      allergy_type: ['', [Validators.required]],
      description: ['',[Validators.required]],
      severity: ['', [Validators.required]],
    });
  }

  // 🔹 Agregar medicamento
  addMedication() {
    this.medications.push(this.newMedication());
  }

  // 🔹 Quitar medicamento
  removeMedication(index: number) {
    if (this.medications.length > 1) {
      this.medications.removeAt(index);
    }
  }

  // 🔹 Agregar alergia
  addAllergy() {
    this.allergies.push(this.newAllergy());
  }

  // 🔹 Quitar alergia
  removeAllergy(index: number) {
    if (this.allergies.length > 1) {
      this.allergies.removeAt(index);
    }
  }

  // 🔹 Obtener FormControl (Para evitar errores de tipado)
  getFormControl(formGroup: FormGroup, fieldName: string): FormControl {
    return formGroup.get(fieldName) as FormControl;
  }

  // 🔹 Enviar el formulario
  submitForm() {
    if (this.form.valid && this.activeBeneficiary) {
      const payload = {
        allergies: this.form.value.allergies,
        medications: this.form.value.medications
      };
  
      this.healthDataService.saveAllergiesAndMedications(payload).subscribe(
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
