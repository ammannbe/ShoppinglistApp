import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device/ngx';

import { ApiService } from '../api.service';
import { TokenService } from '../../database/token/token.service';
import { Token } from './token';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private prefix = '/auth';

  constructor(
    private api: ApiService,
    private token: TokenService,
    private device: Device
  ) {}

  async login(email: string, password: string): Promise<void> {
    await this.logout();

    const token = await this.api
      .post<Token>(`${this.prefix}/token`, {
        email,
        password,
        device_name: this.device.model
      })
      .toPromise();
    await this.token.insert(token);
  }

  async logout(): Promise<void> {
    try {
      await this.api.delete(`${this.prefix}/token`).toPromise();
    } catch (error) {}

    await this.token.remove();
  }
}
