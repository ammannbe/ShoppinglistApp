import { Injectable } from '@angular/core';

import { Token as LoginToken } from './token';
import { ApiService } from '../api.service';
import { TokenService } from '../../database/token/token.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private prefix = '/auth';

  constructor(private api: ApiService, private token: TokenService) {}

  async login(email: string, password: string, remember = true): Promise<void> {
    await this.logout();

    const token = await this.api
      .post<LoginToken>(`${this.prefix}/login`, { email, password, remember })
      .toPromise();
    await this.token.insert(token);
  }

  async logout(): Promise<void> {
    if (await this.token.isValid()) {
      try {
        await this.api.post(`${this.prefix}/logout`).toPromise();
      } catch (error) {}
    }

    await this.token.remove();
  }

  async refresh(): Promise<void> {
    try {
      const token = await this.api
        .post<LoginToken>(`${this.prefix}/login/refresh`)
        .toPromise();
      await this.token.insert(token);
    } catch (error) {
      if (error.status === 401) {
        await this.token.remove();
      }
    }
  }
}
