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
    await this.db.insert(
      'token, expires_at, issued_at',
      `"${token.token}", "${token.expires_at}", "${token.issued_at}"`
    );
  }

  async remove(): Promise<void> {
    const token = await this.queryToken();
    if (token) {
      await this.db.forceDelete(token.id);
    }
  }

  async queryToken(): Promise<Token> {
    this.db.use('token');
    if (this.token) {
      return this.token;
    } else {
      return this.token = await this.db.first<Token>() as Token;
    }
  }
}
