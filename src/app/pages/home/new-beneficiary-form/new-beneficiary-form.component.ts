import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonicModule,
  AlertController,
  LoadingController,
  NavController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { BeneficiaryService } from 'src/app/core/services/beneficiary.service';
import { debounceTime, Subscription } from 'rxjs';
import { CustomInputComponent } from '../../components/inputs/custom-input/custom-input.component';
import { HeaderComponent } from '../../components/home/header/header.component';
import { LocationService } from '../../../modules/auth/services/location.service';
import { environment } from 'src/environments/environment';
import { setupEmailValidation } from 'src/app/shared/utils/form-utils';

@Component({
  selector: 'app-new-beneficiary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CustomInputComponent,
    HeaderComponent,
  ],
  templateUrl: './new-beneficiary-form.component.html',
  styleUrls: ['.//new-beneficiary-form.component.scss'],
})
export class NewBeneficiaryFormComponent implements OnInit, OnDestroy {
  public beneficiaryForm: FormGroup;
  public newImage: boolean = false;
  public selectedImage: string | ArrayBuffer | null = null;
  public file_pub_name: any;
  public databs64: any;
  public buttonBackground: string = 'assets/background/secondary_button_bg.svg';
  public actionSubmit = () => this.editBeneficiary();
  public isAdult: boolean = false;

  private dateSubscription: Subscription | null = null;

  errorMessages: any = {
    first_name: 'El nombre solo puede contener letras.',
    last_name: 'El apellido solo puede contener letras.',
    identification_number: 'Debe ser un número válido.',
    phone: 'Debe ser un número de teléfono válido.',
    email: 'Debe ser un correo electrónico válido.',
  };

  public departmentsOption: any[] = [];
  public citiesOption: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private beneficiaryService: BeneficiaryService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    private locationService: LocationService
  ) {
    this.beneficiaryForm = this.fb.group({
      id: [''],
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
      city_id: ['', Validators.required],
      department: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9-]+$')]],
      birth_date: ['', Validators.required],
      gender: ['', Validators.required],
      blood_type: ['', Validators.required],
      health_provider: [''],
      prepaid_health: [''],
      work_risk_insurance: [''],
      funeral_insurance: [''],
      public_name: ['', Validators.maxLength(50)],
      base_64: ['', Validators.required],
      email: [''],
    });

    this.setupRealTimeValidation();
  }

  ngOnInit() {
    this.beneficiaryForm.reset();

    this.loadDepartments();

    this.route.queryParams.subscribe((params) => {
      if (params['new']) {
        this.beneficiaryService.setActiveBeneficiary(null);
        this.actionSubmit = () => this.saveBeneficiary();
      }
    });

    // Escuchar cambios en el departamento seleccionado y actualizar las ciudades
    this.beneficiaryForm
      .get('department')
      ?.valueChanges.subscribe((departmentId) => {
        if (departmentId) {
          this.beneficiaryForm.patchValue({ city_id: '' });
          this.loadCities(departmentId);
        }
      });

    // Escuchar cambios en la fecha de nacimiento para verificar si es mayor de edad
    this.dateSubscription =
      this.beneficiaryForm
        .get('birth_date')
        ?.valueChanges.subscribe((birthDate) => {
          if (birthDate) {
            this.checkAge(birthDate);
          }
        }) || null;

    this.loadBeneficiaryData();
  }

  ngOnDestroy() {
    if (this.dateSubscription) {
      this.dateSubscription.unsubscribe();
    }
  }

  // Utiliza la función de utilidad para verificar edad y configurar validación
  checkAge(birthDateStr: string) {
    this.isAdult = setupEmailValidation(this.beneficiaryForm, birthDateStr);
  }

  // -------------------------------------- Load Select input options -------------------------------------- //

  loadBeneficiaryData() {
    const beneficiary = this.beneficiaryService.getActiveBeneficiary();

    if (!beneficiary) {
      this.beneficiaryForm.reset();
      this.beneficiaryForm.patchValue({
        id: '',
      });
      return;
    }

    if (beneficiary) {
      this.beneficiaryForm.reset();
      this.beneficiaryForm.patchValue(beneficiary);

      this.beneficiaryForm.patchValue({
        base_64: beneficiary.image?.image_path
          ? `${environment.url}${beneficiary.image.image_path.replace(
              '\\',
              '/'
            )}`
          : '',
      });

      this.selectedImage = beneficiary.image?.image_path
        ? `${environment.url}${beneficiary.image.image_path.replace('\\', '/')}`
        : '';

      this.locationService.fetchDepartments();
      this.locationService.departments$.subscribe((departments) => {
        this.departmentsOption = departments.map((dept) => ({
          value: dept.id,
          label: dept.name,
        }));

        if (beneficiary.location?.department_id) {
          this.beneficiaryForm.patchValue({
            department: beneficiary.location.department_id,
          });
          this.loadCities(
            beneficiary.location.department_id,
            beneficiary.location?.township_id
          );
        }
      });

      // Si tenemos fecha de nacimiento, verificar la edad
      if (beneficiary.birth_date) {
        this.checkAge(beneficiary.birth_date);
      }
    }
  }

  loadDepartments() {
    this.locationService.fetchDepartments();
    this.locationService.departments$.subscribe((departments) => {
      this.departmentsOption = departments.map((dept) => ({
        value: dept.id,
        label: dept.name,
      }));
    });
  }

  loadCities(departmentId: any, cityId?: any) {
    this.locationService.fetchCitiesByDepartment(departmentId);

    this.locationService.cities$.subscribe((cities) => {
      this.citiesOption = cities.map((city) => ({
        value: city.id,
        label: city.name,
      }));

      if (cityId && cities.some((city) => city.id === cityId)) {
        setTimeout(() => {
          this.beneficiaryForm.patchValue({ city_id: cityId });
        }, 100);
      }
    });
  }

  setupRealTimeValidation() {
    this.beneficiaryForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.beneficiaryForm.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });
  }

  getErrorMessage(field: string): string | null {
    if (
      this.beneficiaryForm.get(field)?.invalid &&
      this.beneficiaryForm.get(field)?.touched
    ) {
      return this.errorMessages[field];
    }
    return null;
  }

  async saveBeneficiary() {
    if (this.beneficiaryForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Guardando...',
      });
      await loading.present();

      const beneficiaryData = { ...this.beneficiaryForm.value };

      this.beneficiaryService
        .addBeneficiary(beneficiaryData as Beneficiary)
        .subscribe(
          async () => {
            await loading.dismiss();
            const alert = await this.alertCtrl.create({
              header: 'Éxito',
              message: 'El beneficiario ha sido agregado correctamente.',
              buttons: ['OK'],
            });
            await alert.present();
            this.router.navigate(['/home-desktop/']);
          },
          async (error: any) => {
            await loading.dismiss();
            const alert = await this.alertCtrl.create({
              header: 'Error',
              message: 'Hubo un problema al agregar el beneficiario.',
              buttons: ['OK'],
            });
            await alert.present();
            console.error('Error al agregar beneficiario:', error);
          }
        );
    }
  }

  async editBeneficiary() {
    if (this.beneficiaryForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Guardando...',
      });
      await loading.present();

      const beneficiaryData = { ...this.beneficiaryForm.value };

      this.beneficiaryService
        .updateBeneficiary(beneficiaryData.id, beneficiaryData as Beneficiary)
        .subscribe(
          async () => {
            await loading.dismiss();
            const alert = await this.alertCtrl.create({
              header: 'Éxito',
              message: 'El beneficiario ha sido agregado correctamente.',
              buttons: ['OK'],
            });
            await alert.present();
            this.router.navigate(['/home-desktop/']);
          },
          async (error: any) => {
            await loading.dismiss();
            const alert = await this.alertCtrl.create({
              header: 'Error',
              message: 'Hubo un problema al agregar el beneficiario.',
              buttons: ['OK'],
            });
            await alert.present();
            console.error('Error al agregar beneficiario:', error);
          }
        );
    }
  }

  // Image Controller
  selectImage() {
    document.getElementById('imageInput')?.click();
  }

  async onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      const alert = await this.alertCtrl.create({
        header: 'Formato no válido',
        message: 'Solo se permiten imágenes en formato JPG, PNG o GIF.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      const alert = await this.alertCtrl.create({
        header: 'Archivo demasiado grande',
        message: 'El tamaño máximo permitido es 2MB.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.newImage = true;
      this.selectedImage = e.target.result;
      this.beneficiaryForm.patchValue({
        base_64: e.target.result,
        public_name: file.name,
      });
    };
    reader.readAsDataURL(file);
  }

  // -------------------------------------- Gets form -------------------------------------- //

  get first_name(): FormControl {
    return this.beneficiaryForm.get('first_name') as FormControl;
  }

  get last_name(): FormControl {
    return this.beneficiaryForm.get('last_name') as FormControl;
  }

  get identification_type(): FormControl {
    return this.beneficiaryForm.get('identification_type') as FormControl;
  }

  get identification_number(): FormControl {
    return this.beneficiaryForm.get('identification_number') as FormControl;
  }

  get address(): FormControl {
    return this.beneficiaryForm.get('address') as FormControl;
  }

  get city_id(): FormControl {
    return this.beneficiaryForm.get('city_id') as FormControl;
  }

  get department(): FormControl {
    return this.beneficiaryForm.get('department') as FormControl;
  }

  get gender(): FormControl {
    return this.beneficiaryForm.get('gender') as FormControl;
  }

  get birth_date(): FormControl {
    return this.beneficiaryForm.get('birth_date') as FormControl;
  }

  get phone(): FormControl {
    return this.beneficiaryForm.get('phone') as FormControl;
  }

  get blood_type(): FormControl {
    return this.beneficiaryForm.get('blood_type') as FormControl;
  }

  get health_provider(): FormControl {
    return this.beneficiaryForm.get('health_provider') as FormControl;
  }

  get prepaid_health(): FormControl {
    return this.beneficiaryForm.get('prepaid_health') as FormControl;
  }

  get work_risk_insurance(): FormControl {
    return this.beneficiaryForm.get('work_risk_insurance') as FormControl;
  }

  get funeral_insurance(): FormControl {
    return this.beneficiaryForm.get('funeral_insurance') as FormControl;
  }

  get base_64(): FormControl {
    return this.beneficiaryForm.get('base_64') as FormControl;
  }

  get email(): FormControl {
    return this.beneficiaryForm.get('email') as FormControl;
  }
}
