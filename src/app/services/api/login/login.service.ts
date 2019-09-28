import { Injectable } from '@angular/core';

import { Token as LoginToken } from './token';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private prefix = '/auth';

  constructor(private api: ApiService, private auth: AuthService) {}

  async login(email: string, password: string): Promise<void> {
    await this.logout();

    const token = await this.api
      .post<LoginToken>(`${this.prefix}/login`, { email, password })
      .toPromise();
    await this.auth.setToken(token);
  }

  async logout(): Promise<void> {
    await this.api.post(`${this.prefix}/logout`);
    await this.auth.removeToken();
  }

  async refresh(): Promise<void> {
    const token = await this.api
      .post<LoginToken>(`${this.prefix}/refresh`)
      .toPromise();
    await this.auth.setToken(token);
  }
}
