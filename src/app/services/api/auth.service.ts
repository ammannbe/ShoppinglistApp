import { Injectable } from '@angular/core';

import { Token as LoginToken } from './login/token';
import { UserService } from '../database/user/user.service';
import { TokenService } from '../database/token/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private dbUser: UserService, private token: TokenService) {}

  public async queryToken(): Promise<LoginToken | false> {
    return await this.token.queryToken();
  }

  public async tokenIsValid(): Promise<boolean> {
    return this.token.isValid();
  }
}
