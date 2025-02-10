import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from 'src/app/core/interfaces/auth.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor() {}

  setUser(userData: User) {
    this.userSubject.next(userData);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  clearUser() {
    this.userSubject.next(null);
  }
}
