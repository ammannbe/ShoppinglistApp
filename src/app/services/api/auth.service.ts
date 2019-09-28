import { Injectable } from '@angular/core';

import { Token as LoginToken } from './login/token';
import { UserService } from '../database/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: LoginToken;

  constructor(private dbUser: UserService) {}

  async queryToken(): Promise<LoginToken> {
    console.log('Query auth token');
    if (this.token) {
      console.log('...got it from cache!');
      return this.token;
    } else if (await this.dbUser.getToken()) {
      console.log('...got it from storage!');
      this.token = (await this.dbUser.getToken()) as LoginToken;
      return this.token;
    }
    console.log('...not found!');
    return;
  }

  async setToken(token: LoginToken): Promise<void> {
    this.token = token;
    this.dbUser.setToken(token);
  }

  async removeToken(): Promise<void> {
    this.token = null;
    this.dbUser.setToken(null);
  }

  async tokenIsValid(): Promise<boolean> {
    const data = await this.queryToken();
    if (data) {
      return new Date(data.expires_at) > new Date();
    } else {
      return false;
    }
  }

  async shouldRefreshToken(): Promise<boolean> {
    const token = await this.queryToken();
    return (
      new Date(token.expires_at).getTime() - new Date().getTime() < 7200000
    );
  }
}
