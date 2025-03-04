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


  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.api}${this.version}appointments/create`, appointment).pipe(
      tap((newAppointment) => {
        this.appointments.set([...this.appointments(), newAppointment]); 
      }),
      catchError((error) => {
        console.error('Error al crear cita:', error);
        return of(appointment); 
      })
    );
  }

  /**
   * Actualiza una cita existente en el backend
   */
  updateAppointment(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    console.log("🚀 ~ AppointmentService ~ updateAppointment ~ appointment:", appointment)
    return this.http.put<Appointment>(`${this.api}${this.version}medical-appointment/update/${id}`, appointment).pipe(
      tap((updatedAppointment) => {
        const updatedAppointments = this.appointments().map((appt) =>
          appt.id === id ? { ...appt, ...updatedAppointment } : appt
        );
        this.appointments.set(updatedAppointments);
      }),
      catchError((error) => {
        console.log("🚀 ~ AppointmentService ~ catchError ~ error:", error)
        return of(appointment as Appointment);
      })
    );
  }


  clearCache(): void {
    this.appointments.set([]);
    localStorage.removeItem(this.cacheKey);
  }
}
