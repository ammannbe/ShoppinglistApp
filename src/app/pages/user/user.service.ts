import { Injectable } from '@angular/core';

import { UserService as DbUserService } from '../../services/database/user/user.service';
import { TokenService } from '../../services/database/token/token.service';
import { LoginService } from 'src/app/services/api/login/login.service';
import { User } from 'src/app/services/database/user/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private dbUser: DbUserService,
    private tokenService: TokenService,
    private loginSerivce: LoginService
  ) {}

  public async isLoggedIn(): Promise<boolean> {
    if (await this.dbUser.offlineOnly()) {
      return true;
    }
    if (await this.tokenService.shouldRefresh()) {
      try {
        await this.loginSerivce.refresh();
      } catch (error) {}
    }
    if (await this.tokenService.isValid()) {
      return true;
    }
    return false;
  }

  async login(
    email: string,
    password: string,
    remember: boolean = false
  ): Promise<boolean> {
    await this.dbUser.insert({
      email,
      password,
      offline_only: false
    } as User);
    await this.loginSerivce.login(email, password, remember);
    return true;
  }

  async loginOffline(): Promise<void> {
    await this.dbUser.insert({
      email: 'app@local',
      offline_only: true
    } as User);
    await this.dbUser.setOfflineOnly(true);
  }

  async logout(): Promise<void> {
    await this.dbUser.setOfflineOnly(false);
    await this.loginSerivce.logout();
  }

  async show(): Promise<User> {
    return await this.dbUser.first();
  }
}
