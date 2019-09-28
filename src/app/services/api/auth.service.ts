import { Injectable } from '@angular/core';

import { Token as LoginToken } from './login/token';
import { UserService } from '../database/user/user.service';
import { TokenService } from '../database/token/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private dbUser: UserService, private token: TokenService) {}

  async queryToken(): Promise<LoginToken> {
    return await this.token.queryToken();
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
