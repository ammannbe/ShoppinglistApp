import { Injectable } from '@angular/core';
import { DbService } from '../_base/db.service';
import { Token } from '../../api/login/token';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private token: Token;

  constructor(private db: DbService) {}

  async insert(token: Token): Promise<void> {
    this.db.use('token');
    await this.db.insert(token);
  }

  async remove(): Promise<void> {
    this.db.use('token');
    await this.db.truncate();
  }

  async queryToken(): Promise<Token> {
    if (this.token) {
      return this.token;
    } else {
      this.db.use('token');
      return (this.token = await this.db.first<Token>());
    }
  }
}
