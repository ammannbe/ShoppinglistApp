import { Injectable } from '@angular/core';

import { Token as LoginToken } from './token';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { TokenService } from '../../database/token/token.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private prefix = '/auth';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private token: TokenService
  ) {}

  async login(email: string, password: string): Promise<void> {
    await this.logout();

    const token = await this.api
      .post<LoginToken>(`${this.prefix}/login`, { email, password })
      .toPromise();
    await this.token.insert(token);
  }

  async logout(): Promise<void> {
    await this.token.remove();
    await this.api.post(`${this.prefix}/logout`);
  }

  async refresh(): Promise<void> {
    const token = await this.api
      .post<LoginToken>(`${this.prefix}/refresh`)
      .toPromise();
    await this.token.insert(token);
  }
}
