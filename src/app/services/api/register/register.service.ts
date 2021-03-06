import { Injectable } from '@angular/core';

import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private prefix = 'auth/register';

  constructor(private api: ApiService) {}

  register(
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<any> {
    return this.api.post(`${this.prefix}`, {
      email,
      password,
      password_confirmation: passwordConfirmation
    });
  }

  resend(): Promise<any> {
    return this.api.post<any>(`${this.prefix}/resend`);
  }
}
