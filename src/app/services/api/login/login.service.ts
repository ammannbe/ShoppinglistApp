import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device/ngx';

import { ApiService } from '../api.service';
import { TokenService } from '../../storage/token/token.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private prefix = 'auth';

  constructor(
    private apiService: ApiService,
    private tokenService: TokenService,
    private device: Device
  ) {}

  async login(email: string, password: string): Promise<void> {
    await this.logout();

    const token = await this.apiService.post<{ token: string }>(
      `${this.prefix}/token`,
      {
        email,
        password,
        device_name: this.device.model
      }
    );
    await this.tokenService.set(token);
  }

  async logout(): Promise<void> {
    try {
      await this.apiService.delete(`${this.prefix}/token`);
    } catch (error) {}

    await this.tokenService.remove();
  }
}
