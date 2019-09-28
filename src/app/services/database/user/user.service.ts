import { Injectable } from '@angular/core';
import { Token } from '../../api/login/token';
import { User } from 'src/app/pages/user/user';
import { DbService } from '../_base/db.service';

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
      return await this.db.first<User>() as User;
    }
  }

  async insert(
    email: string,
    password: string,
    offlineOnly: boolean
  ): Promise<boolean> {
    console.log(await this.queryUser());
    if (await this.queryUser()) {
      return false;
    } else {
      this.db.use('user');
      await this.db.insert(
        'email, password, offline_only',
        `"${email}", "${password}", "${offlineOnly}"`
      );
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
      return user.offline_only;
    }
    return null;
  }

  async setOfflineOnly(isset: boolean = false): Promise<void> {
    const user = await this.queryUser();
    await this.db.update(user.id, `offline_only=${(isset ? 1 : 0)}`);
  }
}
