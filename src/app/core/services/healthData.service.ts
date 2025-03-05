import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Vaccination, Allergy, Disease, MedicalHistory, FamilyHistory, Disability, Distinctive, Medication } from 'src/app/core/interfaces/beneficiary.interface';

const apiUrl = environment.url;

@Injectable({ providedIn: 'root' })
export class HealthDataService {
  constructor(private http: HttpClient) {}

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

}
