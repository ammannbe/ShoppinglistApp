import { Injectable } from '@angular/core';

import { DbService } from '../_base/db.service';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: User;

  constructor(private db: DbService) {}

  async queryUser(): Promise<User> {
    this.db.use('user');
    if (this.user) {
      return this.user;
    } else {
      return await this.db.first<User>();
    }
  }

  async insert(
    email: string,
    password: string,
    offlineOnly: boolean
  ): Promise<boolean> {
    if (await this.queryUser()) {
      return false;
    } else {
      this.db.use('user');
      const user: User = {
        id: null,
        email,
        password,
        offline_only: offlineOnly,
        created_at: null,
        updated_at: null,
        deleted_at: null
      };
      await this.db.insert(user);
      return true;
    }
  }

  async getEmail(): Promise<string> {
    const user = await this.queryUser();
    if (user) {
      return user.email;
    }
    return null;
  }

  async offlineOny(): Promise<boolean> {
    const user = await this.queryUser();
    if (user) {
      return !!user.offline_only;
    }
    return null;
  }

  async setOfflineOnly(isset: boolean = true): Promise<void> {
    const user = await this.queryUser();
    if (user) {
      await this.db.update(user.id, { offline_only: isset });
    }
  }
}
