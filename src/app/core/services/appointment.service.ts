import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Appointment, AppointmentResponse } from '../interfaces/appointment.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private cacheKey = 'appointmentCache';
  public appointments = signal<Appointment[]>([]);
  public api = environment.url;
  public version = 'api/v1/';

  constructor(private http: HttpClient) {
    this.loadFromCache();
  }

  private saveToCache(data: Appointment[]): void {
    this.appointments.set(data);
    localStorage.setItem(this.cacheKey, JSON.stringify(data));
  }

  private loadFromCache(): void {
    const cachedData = localStorage.getItem(this.cacheKey);
    if (cachedData) {
      this.appointments.set(JSON.parse(cachedData));
    }
  }

  cancelAppointment(id: number): Observable<any> {
    return this.http.delete(`${this.api}${this.version}medical-appointment/cancel/${id}`).pipe(
      tap(() => {
        const updatedAppointments = this.appointments().filter(appt => appt.id !== id);
        this.appointments.set(updatedAppointments);
      }),
      catchError(error => {
        console.error('Error al cancelar la cita:', error);
        return of(null);
      })
    );
  }

  createAppointment(appointment: Appointment): Observable<any> {
    const isManualPending = appointment.status === 'TO_BE_CONFIRMED';
    
    const endpoint = isManualPending 
      ? `${this.api}${this.version}medical-appointment/create-pending`
      : `${this.api}${this.version}medical-appointment/create-new`;

    return this.http.post<AppointmentResponse>(endpoint, appointment).pipe(
      tap((response) => {
        if (response && response.data) {
          this.appointments.set([...this.appointments(), response.data]);
        }
      }),
      catchError((error) => {
        console.error('Error al crear cita:', error);
        return of({
          message: 'Error al crear la cita',
          data: appointment,
          statusCode: 500
        } as AppointmentResponse);
      })
    );
  }

  /**
   * Actualiza una cita existente en el backend
   */
  updateAppointment(id: number, appointment: Partial<Appointment>): Observable<any> {
    console.log("🚀 ~ AppointmentService ~ updateAppointment ~ appointment:", appointment);
    
    return this.http.put<AppointmentResponse>(`${this.api}${this.version}medical-appointment/update/${id}`, appointment).pipe(
      tap((response) => {
        if (response && response.data) {
          const updatedAppointments = this.appointments().map((appt) =>
            appt.id === id ? { ...appt, ...response.data } : appt
          );
          this.appointments.set(updatedAppointments);
        }
      }),
      catchError((error) => {
        console.log("🚀 ~ AppointmentService ~ catchError ~ error:", error);
        return of({
          message: 'Error al actualizar la cita',
          data: appointment as Appointment,
          statusCode: 500
        } as AppointmentResponse);
      })
    );
  }

  /**
   * Obtener todas las citas pendientes por confirmar (para agentes de call center)
   */
  getPendingAppointments(): Observable<Appointment[]> {
    return this.http.get<{ data: Appointment[] }>(`${this.api}${this.version}medical-appointment/pending`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error al obtener citas pendientes:', error);
        return of([]);
      })
    );
  }

  clearCache(): void {
    this.appointments.set([]);
    localStorage.removeItem(this.cacheKey);
  }
}