import { Injectable } from '@angular/core';

import { UserService as DbUserService } from '../../services/database/user/user.service';
import { AuthService } from 'src/app/services/api/auth.service';
import { LoginService } from 'src/app/services/api/login/login.service';
import { UserService as ApiUserService } from 'src/app/services/api/user/user.service';
import { User } from 'src/app/services/database/user/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private dbUser: DbUserService,
    private authService: AuthService,
    private loginSerivce: LoginService
  ) {}

  public async isLoggedIn(): Promise<boolean> {
    if (await this.dbUser.offlineOny()) {
      return true;
    }
    if (await this.authService.tokenIsValid()) {
      return true;
    }
    return false;
  }

  async login(
    email: string,
    password: string,
    remember: boolean = false
  ): Promise<boolean> {
    await this.dbUser.insert(<User>{
      email,
      password,
      offline_only: false
    });
    await this.loginSerivce.login(email, password, remember);
    return true;
  }

  async loginOffline(): Promise<void> {
    await this.dbUser.insert(<User>{
      email: 'app@local',
      offline_only: true
    });
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
