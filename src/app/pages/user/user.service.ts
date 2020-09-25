import { User } from './user';
import { Injectable } from '@angular/core';

import { UserService as StorageUserService } from '../../services/storage/user/user.service';
import { TokenService } from 'src/app/services/storage/token/token.service';
import { LoginService } from 'src/app/services/api/login/login.service';
import { OfflineModeService } from 'src/app/services/storage/offline-mode/offline-mode.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private storageUserService: StorageUserService,
    private offlineModeService: OfflineModeService,
    private tokenService: TokenService,
    private loginSerivce: LoginService
  ) {}

  public async isLoggedIn(): Promise<boolean> {
    if (await this.offlineModeService.enabled()) {
      return true;
    }
    if (await this.tokenService.exists()) {
      return true;
    }
    return false;
  }

  async login(email: string, password: string): Promise<boolean> {
    await this.offlineModeService.disable();
    await this.storageUserService.set({ email });
    await this.loginSerivce.login(email, password);
    return true;
  }

  async loginOffline(): Promise<void> {
    await this.offlineModeService.enable();
  }

  async logout(): Promise<void> {
    await this.offlineModeService.remove();
    await this.storageUserService.remove();
    await this.loginSerivce.logout();
  }

  async show(): Promise<User> {
    return await this.storageUserService.get();
  }
}
