import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { Beneficiary } from 'src/app/core/interfaces/beneficiary.interface';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';

const apiUrl = environment.url;

@Injectable({ providedIn: 'root' })
export class BeneficiaryService {
  private beneficiariesSubject = new BehaviorSubject<Beneficiary[]>([]);
  public beneficiaries$ = this.beneficiariesSubject.asObservable();

  constructor(private http: HttpClient, private userService: UserService) {}

  addBeneficiary(data: Beneficiary): Observable<any> {
    const user = this.userService.getUser();

    if (!user || !user.id) {
      return throwError(() => new Error('Usuario no autenticado.'));
    }

    const beneficiary = {
      ...data,
      user_id: user.id,
    };

    return this.http
      .post(`${apiUrl}api/v1/beneficiary/create`, beneficiary)
      .pipe(
        map((response: any) => {
          if (response.statusCode === 200 && response.data) {
            const currentBeneficiaries = this.beneficiariesSubject.value;

            const updatedBeneficiaries = [
              ...currentBeneficiaries,
              response.data,
            ];

            this.beneficiariesSubject.next(updatedBeneficiaries);

            localStorage.setItem(
              'beneficiaries',
              JSON.stringify(updatedBeneficiaries)
            );
          }
          return response;
        }),
        catchError((error) => throwError(() => error))
      );
  }

  setBeneficiaries(beneficiaries: Beneficiary[]): void {
    this.beneficiariesSubject.next(beneficiaries);
  }

  getBeneficiaries(): Beneficiary[] {
    return this.beneficiariesSubject.value;
  }

  clearBeneficiaries(): void {
    this.beneficiariesSubject.next([]);
  }
}
