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
import { RegisterData } from 'src/app/core/interfaces/auth.interface';
import { PrivacyDialogService } from 'src/app/modules/legal/services/privacy-dialog.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    CustomInputComponent,
    IonicModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  @Output() registerSuccess = new EventEmitter<void>();
  public selectedImage: string | ArrayBuffer | null = null;
  registerForm: FormGroup;

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
    phone: 'Debe ser un número de teléfono válido con al menos 10 dígitos.',
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
    private alertCtrl: AlertController,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private locationService: LocationService,
    private router: Router,
    private privacyDialogService: PrivacyDialogService,
  ) {
    this.registerForm = this.fb.group(
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
        phone: [
          '',
          [
            Validators.required,
            Validators.pattern('^[0-9-]+$'),
            Validators.minLength(10),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$'
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        public_name: [''],
        base_64: ['', Validators.required],
        privacy_policy: [false, Validators.requiredTrue],
      },
      { validator: this.passwordMatchValidator }
    );

    this.setupRealTimeValidation();
  }

  ngOnInit() {
    this.loadDepartments();
    console.log(this.departmentsOptions);

    this.registerForm
      .get('password')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.registerForm
          .get('confirmPassword')
          ?.updateValueAndValidity({ onlySelf: true });
      });

    this.registerForm
      .get('confirmPassword')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.registerForm
          .get('confirmPassword')
          ?.updateValueAndValidity({ onlySelf: true });
      });

    this.registerForm
      .get('department')
      ?.valueChanges.subscribe((departmentId) => {
        this.loadCities(departmentId);
      });
  }

  // -------------------------------------- Gets form -------------------------------------- //

  get first_name(): FormControl {
    return this.registerForm.get('first_name') as FormControl;
  }

  get last_name(): FormControl {
    return this.registerForm.get('last_name') as FormControl;
  }

  get identification_type(): FormControl {
    return this.registerForm.get('identification_type') as FormControl;
  }

  get identification_number(): FormControl {
    return this.registerForm.get('identification_number') as FormControl;
  }

  get address(): FormControl {
    return this.registerForm.get('address') as FormControl;
  }

  get city(): FormControl {
    return this.registerForm.get('city') as FormControl;
  }

  get department(): FormControl {
    return this.registerForm.get('department') as FormControl;
  }

  get gender(): FormControl {
    return this.registerForm.get('gender') as FormControl;
  }

  get birth_date(): FormControl {
    return this.registerForm.get('birth_date') as FormControl;
  }

  get phone(): FormControl {
    return this.registerForm.get('phone') as FormControl;
  }

  get email(): FormControl {
    return this.registerForm.get('email') as FormControl;
  }

  get password(): FormControl {
    return this.registerForm.get('password') as FormControl;
  }

  get confirmPassword(): FormControl {
    return this.registerForm.get('confirmPassword') as FormControl;
  }

  get publicName(): FormControl {
    return this.registerForm.get('public_name') as FormControl;
  }

  get base64(): FormControl {
    return this.registerForm.get('base_64') as FormControl;
  }

  get privacyPolicy(): FormControl {
    return this.registerForm.get('privacy_policy') as FormControl;
  }

  // -------------------------------------- Send Form Controller -------------------------------------- //

  async register() {
    if (!this.selectedImage) {
      const alert = await this.alertCtrl.create({
        header: 'Falta imagen',
        message: 'Por favor, carga una imagen antes de continuar.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (this.registerForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Registrando...',
      });
      await loading.present();
      const { confirmPassword, ...registerData } = this.registerForm.value;

      registerData.phone = String(registerData.phone);
      const registerPayload = {
        ...registerData,
        city_id: Number(registerData.city) || null,
      };
      delete registerPayload.city;

      this.authService.register(registerPayload as RegisterData).subscribe(
        async () => {
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Registro exitoso',
            message:
              'Tu cuenta ha sido creada con éxito. Por favor, revisa tu correo.',
            buttons: ['OK'],
          });
          await alert.present();
          this.registerSuccess.emit();
          this.router.navigateByUrl('/desktop');
        },
        async (error) => {
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Error en el registro',
            message: 'Hubo un problema al crear la cuenta. Inténtalo de nuevo.',
            buttons: ['OK'],
          });
          await alert.present();
          console.error('Error en el registro:', error);
        }
      );
    }
  }

  // -------------------------------------- Load Select input options -------------------------------------- //

  loadDepartments() {
    this.locationService.fetchDepartments();
    this.locationService.departments$.subscribe((departments) => {
      this.departmentsOptions = departments.map((dept) => ({
        value: dept.id,
        label: dept.name,
      }));
    });
  }

  loadCities(departmentId: number) {
    this.locationService.fetchCitiesByDepartment(departmentId);
    this.locationService.cities$.subscribe((cities) => {
      this.citiesOptions = cities.map((city) => ({
        value: city.id,
        label: city.name,
      }));
    });
  }

  // -------------------------------------- Form Controller -------------------------------------- //

  setupRealTimeValidation() {
    this.registerForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.registerForm.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });
  }

  passwordMatchValidator(formGroup: FormGroup): null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword');

    if (!confirmPassword) return null;

    if (confirmPassword.value && confirmPassword.value !== password) {
      confirmPassword.setErrors({ mismatch: true });
    } else {
      confirmPassword.setErrors(null);
    }

    return null;
  }

  getErrorMessage(field: string): string | null {
    if (
      this.registerForm.get(field)?.invalid &&
      this.registerForm.get(field)?.touched
    ) {
      return this.errorMessages[field];
    }
    return null;
  }

  // -------------------------------------- Image Controller -------------------------------------- //

  selectImage() {
    document.getElementById('imageInput')?.click();
  }

  async onImageSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    // Validar tipo de archivo (aceptamos HEIC, JPEG, PNG y GIF)
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/heic',
      'image/heif',
    ];
    if (!validTypes.includes(file.type)) {
      const alert = await this.alertCtrl.create({
        header: 'Formato no válido',
        message: 'Solo se permiten imágenes en formato JPG, PNG, GIF o HEIC.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // Validar tamaño (máximo 2MB)
    const maxSize = 5 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      const alert = await this.alertCtrl.create({
        header: 'Archivo demasiado grande',
        message: 'El tamaño máximo permitido es 2MB.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }
    // Convertir imagen a base64
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedImage = e.target.result;
      this.registerForm.patchValue({
        base_64: e.target.result,
        public_name: file.name,
      });
    };
    reader.readAsDataURL(file);
  }

  async showPrivacyPolicy(event: Event) {
    event.preventDefault(); // Evitar que el enlace navegue
    await this.privacyDialogService.openPrivacyPolicy();
  }
}
