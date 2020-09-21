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

  public async first<Token>(): Promise<Token> {
    if (!this.token) {
      this.token = (await super.first<Token>()) as any;
    }

    return this.token as any;
  }

  public async insert(token: Token): Promise<void> {
    await this.remove();
    await super.insert(token);
    this.token = await this.first();
  }

  public async remove(): Promise<void> {
    delete this.token;
    await super.truncate();
  }
}
