// src/app/modules/legal/services/privacy-dialog.service.ts
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PrivacyPolicyComponent } from '../privacy_policy/privacy-policy.component';

@Injectable({
  providedIn: 'root'
})
export class PrivacyDialogService {
  
  constructor(private modalController: ModalController) {}
  
  /**
   * Abre un modal con las políticas de privacidad
   */
  async openPrivacyPolicy() {
    const modal = await this.modalController.create({
      component: PrivacyPolicyComponent,
      cssClass: 'privacy-policy-modal',
      backdropDismiss: true,
      showBackdrop: true
    });
    
    await modal.present();
    
    return modal.onDidDismiss();
  }
}