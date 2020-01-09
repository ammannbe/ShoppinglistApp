import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { DbService } from '../_base/db.service';
import { QueriesService } from '../_base/queries.service';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService extends DbService {
  protected table = 'user';
  private user: User;

  constructor(protected sqlite: SQLite, protected queries: QueriesService) {
    super(sqlite, queries);
  }

  public async first<User = any>(): Promise<User> {
    if (this.user) {
      return this.user as any;
    }

    return super.first<User>();
  }

  public async insert(user: User): Promise<void> {
    if (await this.first()) {
      return;
    }

    return super.insert(user);
  }

  public async getEmail(): Promise<string | null> {
    const user = await this.first();
    let email = null;

    if (user) {
      email = user.email;
    }

    return email;
  }

  public async offlineOny(): Promise<boolean> {
    const user = await this.first();
    let offlineOnly = false;

    if (user) {
      offlineOnly = !!user.offline_only;
    }
    return !!offlineOnly;
  }

  public async setOfflineOnly(isset: boolean = true): Promise<void> {
    const user = await this.first();

    if (!user) {
      return;
    }

    return super.update(user.id, { offline_only: isset });
  }
}
