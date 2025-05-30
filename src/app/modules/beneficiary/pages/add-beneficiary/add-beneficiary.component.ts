import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
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
import { debounceTime, Subscription } from 'rxjs';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';
import { LocationService } from '../../../auth/services/location.service';
import { BeneficiaryService } from '../../../../core/services/beneficiary.service';
import { environment } from 'src/environments/environment';

import { ActivatedRoute } from '@angular/router';
import { setupEmailValidation } from 'src/app/shared/utils/form-utils';
@Component({
  selector: 'app-add-beneficiary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TabBarComponent,
    CustomButtonComponent,
  ],
  templateUrl: './add-beneficiary.component.html',
  styleUrls: ['./add-beneficiary.component.scss'],
})
export class AddBeneficiaryComponent implements OnInit, OnDestroy {
  public beneficiaryForm: FormGroup;
  public newImage: boolean = false;
  public selectedImage: string | ArrayBuffer | null = null;
  public file_pub_name: any;
  public databs64: any;
  imageLoaded: string = '';
  public buttonBackground: string = 'assets/background/secondary_button_bg.svg';

  public isAdult: boolean = false;
  private dateSubscription: Subscription | null = null;

  errorMessages: any = {
    first_name: 'El nombre solo puede contener letras.',
    last_name: 'El apellido solo puede contener letras.',
    identification_number: 'Debe ser un número válido.',
    phone: 'Debe ser un número de teléfono válido.',
    email: 'Debe ser un correo electrónico válido.',
  };

  public departments: any[] = [];
  public cities: any[] = [];

  constructor(
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
      blood_type: [''],
      health_provider: [''],
      prepaid_health: [''],
      work_risk_insurance: [''],
      funeral_insurance: [''],
      public_name: ['', Validators.maxLength(50)],
      base_64: [''],
      email: [''],
    });

    this.setupRealTimeValidation();
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['new']) {
        this.beneficiaryService.setActiveBeneficiary(null);
      }
    });

    this.loadDepartments();

    this.beneficiaryForm
      .get('department')
      ?.valueChanges.subscribe((departmentId) => {
        if (departmentId) {
          this.beneficiaryForm.patchValue({ city_id: '' });
          this.loadCities(departmentId);
        }
      });

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

  checkAge(birthDateStr: string) {
    this.isAdult = setupEmailValidation(this.beneficiaryForm, birthDateStr);
  }

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
      this.beneficiaryForm.patchValue(beneficiary);

      this.imageLoaded = beneficiary.image?.image_path
        ? `${environment.url}${beneficiary.image.image_path.replace('\\', '/')}`
        : '';

      this.locationService.fetchDepartments();
      this.locationService.departments$.subscribe((departments) => {
        this.departments = departments;

        if (beneficiary.location?.department_id) {
          this.beneficiaryForm.patchValue({
            department: beneficiary.location.department_id,
          });

          this.loadCities(
            beneficiary.location.department_id,
            beneficiary.location?.township_id
          );
        }

        if (beneficiary.birth_date) {
          this.checkAge(beneficiary.birth_date);
        }
      });
    }
  }

  loadDepartments() {
    this.locationService.fetchDepartments();
    this.locationService.departments$.subscribe((departments) => {
      this.departments = departments;
    });
  }

  loadCities(departmentId: any, cityId?: any) {
    this.locationService.fetchCitiesByDepartment(departmentId);

    this.locationService.cities$.subscribe((cities) => {
      this.cities = cities;

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
      const isEditing = !!beneficiaryData.id;

      const action$ = isEditing
        ? this.beneficiaryService.updateBeneficiary(
            beneficiaryData.id,
            beneficiaryData
          )
        : this.beneficiaryService.addBeneficiary(beneficiaryData);

      action$.subscribe(
        async () => {
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Éxito',
            message: isEditing
              ? 'Beneficiario actualizado correctamente.'
              : 'Beneficiario agregado correctamente.',
            buttons: ['OK'],
          });
          await alert.present();
          this.navCtrl.navigateRoot('/home/dashboard');
        },
        async (error: any) => {
          console.log('🚀 ~ AddBeneficiaryComponent ~ error:', error);
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: 'Error',
            message: error.message,
            buttons: ['OK'],
          });
          await alert.present();
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
}
