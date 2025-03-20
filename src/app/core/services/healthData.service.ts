import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Vaccination, Allergy, Disease, MedicalHistory, FamilyHistory, Disability, Distinctive, Medication } from 'src/app/core/interfaces/beneficiary.interface';
import { UserHealthService } from './user-health.service';

const apiUrl = environment.url;

@Injectable({ providedIn: 'root' })
export class HealthDataService {
  constructor(private http: HttpClient,  private userHealthService?: UserHealthService) {}

  saveVaccinations(vaccinations: Vaccination[]): Observable<any> {
    return this.http.post(`${apiUrl}api/v1/beneficiary/vaccinations/create`, { vaccinations });
  }

  saveMedicalAndFamilyHistory(data: { medicalHistory: MedicalHistory[], familyHistory: FamilyHistory[] }): Observable<any> {
    return this.http.post(`${apiUrl}api/v1/beneficiary/history/create`, data);
  }  

  saveHealthData(data: { diseases: Disease[], disabilities: Disability[], distinctives: Distinctive[] }): Observable<any> {
    return this.http.post(`${apiUrl}api/v1/beneficiary/health-data/create`, data);
  }
  
  saveAllergiesAndMedications(data: { allergies: Allergy[], medications: Medication[] }): Observable<any> {
    return this.http.post(`${apiUrl}api/v1/beneficiary/allergies-medications/create`, data);
  }

  // Helper method to load user health data
  getUserHealthData() {
    if (this.userHealthService) {
      // Use injected service if available
      this.userHealthService.getUserHealthData();
    } else if ((window as any).Injector) {
      // Fallback to window injector
      try {
        const healthService = (window as any).Injector.get(UserHealthService);
        healthService.getUserHealthData();
      } catch (error) {
        console.error('Error getting UserHealthService:', error);
      }
    }
  }

}
