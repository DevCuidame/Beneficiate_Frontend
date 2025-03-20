import { Component, Output, OnInit, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { HeaderComponent } from '../../../components/header/header.component';
import { CustomInputComponent } from '../../../components/inputs/custom-input/custom-input.component';
import { LocationService } from '../../../../modules/auth/services/location.service';
import { AuthService } from '../../../../modules/auth/services/auth.service';


@Component({
  selector: 'app-work-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    CustomInputComponent,
    IonicModule,
  ],
  templateUrl: './work-form.component.html',
  styleUrls: ['./work-form.component.scss'],
})
export class WorkFormComponent implements OnInit {
  @Output() registerSuccess = new EventEmitter<void>();
  public selectedImage: string | ArrayBuffer | null = null;
  workForm: FormGroup;

  generoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'Other', label: 'Otro' },
  ];
  identificacionOptions = [
    { value: 'CC', label: 'Cédula' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PASSPORT', label: 'Pasaporte' },
    { value: 'OTHER', label: 'Otro' },
  ];
  public departmentsOptions: any[] = [];
  public citiesOptions: any[] = [];

  errorMessages: any = {
    first_name: 'El nombre solo puede contener letras.',
    last_name: 'El apellido solo puede contener letras.',
    identification_number: 'Debe ser un número válido.',
    phone: 'Debe ser un número de teléfono válido.',
    address: 'La dirección no es valida.',
    email: 'Ingrese un correo electrónico válido.',
    gender: 'El género es obligatorio.',
    birth_date: 'La fecha de cumpleaños es obligatoria.',
    password:
      'La contraseña debe contener al menos 8 caracteres, una mayúscula y un número.',
    confirmPassword: 'Las contraseñas no coinciden.',
    base_64: 'La imagen es obligatoria.',
  };

  // -------------------------------------- Initial Logic -------------------------------------- //

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private router: Router,
  ) {
    this.workForm = this.fb.group(
      {
        first_name: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')],
        ],
        last_name: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')],
        ],
        identification_type: ['', Validators.required],
        identification_number: [
          '',
          [Validators.required, Validators.pattern('^[0-9]+$')],
        ],
        address: ['', Validators.required],
        city: [null, Validators.required],
        department: [null, Validators.required],
        gender: ['', Validators.required],
        birth_date: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern('^[0-9-]+$')]],
        email: ['', [Validators.required, Validators.email]],
        privacy_policy: [false, Validators.requiredTrue],
      },
    );

    this.setupRealTimeValidation();
  }

  ngOnInit() {
    this.loadDepartments();
    console.log(this.departmentsOptions);

    this.workForm
      .get('department')
      ?.valueChanges.subscribe((departmentId) => {
        this.loadCities(departmentId);
      });
  }

  // -------------------------------------- Load Select input options -------------------------------------- //

  loadDepartments() {
    this.locationService.fetchDepartments();
    this.locationService.departments$.subscribe((departments) => {
      this.departmentsOptions = departments.map(dept => ({
        value: dept.id,
        label: dept.name
      }));
    });
  }

  loadCities(departmentId: number) {
    this.locationService.fetchCitiesByDepartment(departmentId);
    this.locationService.cities$.subscribe((cities) => {
      this.citiesOptions = cities.map(city => ({
        value: city.id,
        label: city.name
      }));
    });
  }

  // -------------------------------------- Form Controller -------------------------------------- //

  setupRealTimeValidation() {
    this.workForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.workForm.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });
  }

  getErrorMessage(field: string): string | null {
    if (
      this.workForm.get(field)?.invalid &&
      this.workForm.get(field)?.touched
    ) {
      return this.errorMessages[field];
    }
    return null;
  }

  // -------------------------------------- Gets form -------------------------------------- //

  get first_name(): FormControl {
    return this.workForm.get('first_name') as FormControl;
  }

  get last_name(): FormControl {
    return this.workForm.get('last_name') as FormControl;
  }

  get identification_type(): FormControl {
    return this.workForm.get('identification_type') as FormControl;
  }

  get identification_number(): FormControl {
    return this.workForm.get('identification_number') as FormControl;
  }

  get address(): FormControl {
    return this.workForm.get('address') as FormControl;
  }

  get city(): FormControl {
    return this.workForm.get('city') as FormControl;
  }

  get department(): FormControl {
    return this.workForm.get('department') as FormControl;
  }

  get gender(): FormControl {
    return this.workForm.get('gender') as FormControl;
  }

  get birth_date(): FormControl {
    return this.workForm.get('birth_date') as FormControl;
  }

  get phone(): FormControl {
    return this.workForm.get('phone') as FormControl;
  }

  get email(): FormControl {
    return this.workForm.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.workForm.get('password') as FormControl;
  }

  get confirmPassword(): FormControl {
    return this.workForm.get('confirmPassword') as FormControl;
  }

  get publicName(): FormControl {
    return this.workForm.get('public_name') as FormControl;
  }

  get base64(): FormControl {
    return this.workForm.get('base_64') as FormControl;
  }

  get privacyPolicy(): FormControl {
    return this.workForm.get('privacy_policy') as FormControl;
  }

}
