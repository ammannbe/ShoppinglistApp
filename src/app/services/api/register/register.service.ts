import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private prefix = '/auth/register';

  constructor(private api: ApiService, private auth: AuthService) {}

  register(
    email: string,
    password: string,
    passwordConfirmation: string
  ): Observable<any> {
    return this.api.post(`${this.prefix}`, {
      email,
      password,
      password_confirmation: passwordConfirmation
    });
  }

  status(): Observable<any> {
    return this.api.get<any>(`${this.prefix}/status`);
  }

  resend(): Observable<any> {
    return this.api.post<any>(`${this.prefix}/resend`);
  }
}
