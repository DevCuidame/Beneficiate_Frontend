// src/app/modules/legal/privacy-policy/privacy-policy.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { PrivacyDialogService } from '../services/privacy-dialog.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
  constructor(private router: Router, private privacyDialogService: PrivacyDialogService,) {}

  goBack(event: Event) {
    event.preventDefault();
    this.privacyDialogService.closePrivacyPolicy();
  }
}