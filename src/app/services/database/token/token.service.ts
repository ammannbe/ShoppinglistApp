import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { DbService } from '../_base/db.service';
import { QueriesService } from '../_base/queries.service';
import { Token } from '../../api/login/token';

@Injectable({
  providedIn: 'root'
})
export class TokenService extends DbService {
  protected table = 'token';
  private token: Token;

  constructor(protected sqlite: SQLite, protected queries: QueriesService) {
    super(sqlite, queries);
  }

  public async first<Token = any>(): Promise<Token> {
    if (!this.token) {
      this.token = (await super.first<Token>()) as any;
    }

    return this.token as any;
  }

  public async insert(token: Token): Promise<void> {
    super.insert(token);
  }

  public async remove(): Promise<void> {
    super.truncate();
  }

  public async queryToken(): Promise<Token | false> {
    const token = await this.first();

    if (!token) {
      return false;
    }

    if (!(await this.isValid())) {
      return false;
    }

    return token;
  }

  public async isValid(): Promise<boolean> {
    const token = await this.first();
    if (!token) {
      return false;
    }
    const expiresAt = token.expires_at;
    return new Date(expiresAt) > new Date();
  }

  public async shouldRefresh(): Promise<boolean> {
    const token = await this.first();
    const expiresAt = new Date(token.expires_at).getTime();
    const now = new Date().getTime();
    return expiresAt - now < 7200000; // 2h in milliseconds
  }
}
