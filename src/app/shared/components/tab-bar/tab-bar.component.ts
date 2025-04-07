import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})
export class TabBarComponent {
  @Input() isVisible: boolean = true; // Controla si la barra se muestra
  @Input() buttons: { icon: string; route: string; visible: boolean }[] = [];
  @Input() background: string = '';
  
  showMenu: boolean = false;
  menuItems: { icon: string; label: string; action: () => void }[] = [];
  deleteAccountForm: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private formBuilder: FormBuilder
  ) {
    // Inicializar formulario para eliminar cuenta
    this.deleteAccountForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Opciones del menú desplegable
    this.menuItems = [
      // { 
      //   icon: 'person-outline', 
      //   label: 'Mi perfil', 
      //   action: () => this.navigateToProfile() 
      // },
      { 
        icon: 'trash-outline', 
        label: 'Eliminar Cuenta', 
        action: () => this.deleteAccount() 
      },
      { 
        icon: 'log-out-outline', 
        label: 'Cerrar sesión', 
        action: () => this.confirmLogout() 
      }
    ];
  }

  navigate(route: string) {
    if (route) {
      this.router.navigate([route]);
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  // Oculta el menú si se hace clic fuera de él
  hideMenu() {
    setTimeout(() => {
      this.showMenu = false;
    }, 100);
  }

  async confirmLogout() {
    this.showMenu = false;
    
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button'
        },
        {
          text: 'Confirmar',
          cssClass: 'confirm-button',
          handler: () => {
            this.logout();
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteAccount() {
    this.showMenu = false;
    
    const alert = await this.alertController.create({
      header: 'Eliminar Cuenta',
      message: 'Esta acción eliminará permanentemente tu cuenta y todos tus datos. Por favor, confirma tu contraseña para continuar.',
      cssClass: 'custom-alert',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Contraseña',
          attributes: {
            autocomplete: 'current-password'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button'
        },
        {
          text: 'Eliminar',
          cssClass: 'danger-button',
          handler: async (data) => {
            if (!data.password) {
              this.presentToast('Por favor, ingresa tu contraseña', 'danger');
              return false; // Evitar que se cierre el alert
            }
            // Proceder con eliminación
            this.confirmDeleteAccount(data.password);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDeleteAccount(password: string) {
    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Eliminando cuenta...',
      cssClass: 'custom-loading'
    });
    await loading.present();
  
    // Llamar al servicio para eliminar la cuenta
    this.authService.deleteAccount(password).subscribe({
      next: (response) => {
        loading.dismiss();
        this.presentToast('Tu cuenta ha sido eliminada correctamente', 'success');
        // La función logout ya se ejecuta dentro del servicio AuthService
        this.router.navigate(['/login']);
      },
      error: (error) => {
        loading.dismiss();
        let errorMessage = 'Error al eliminar la cuenta';
        
        // Manejo más detallado de errores
        if (error.status === 401) {
          errorMessage = 'Contraseña incorrecta';
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor. Inténtalo más tarde.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.presentToast(errorMessage, 'danger');
        
        // No hacer logout ni redirección en caso de error
        console.log('Error en eliminación de cuenta:', error);
      }
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
      cssClass: 'custom-toast'
    });
    toast.present();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}