import { Injectable } from '@angular/core';

import { UserService as DbUserService } from '../../services/database/user/user.service';
import { AuthService } from 'src/app/services/api/auth.service';
import { LoginService } from 'src/app/services/api/login/login.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private dbUser: DbUserService,
    private authService: AuthService,
    private loginSerivce: LoginService
  ) {}

  async isLoggedIn(): Promise<boolean> {
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
    remember?: boolean
  ): Promise<boolean> {
    await this.dbUser.insert(email, password, false);
    await this.loginSerivce.login(email, password);
    return true;
  }

  async loginOffline(): Promise<void> {
    await this.dbUser.insert('app@local', '', true);
    await this.dbUser.setOfflineOnly(true);
  }

  async logout(): Promise<void> {
    await this.dbUser.setOfflineOnly(false);
    await this.loginSerivce.logout();
  }
}
