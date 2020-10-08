import { Injectable } from '@angular/core';

import { ApiService } from '../api.service';
import { User } from './../../storage/user/user';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListShareService {
  private prefix = 'shopping-lists';
  private suffix = 'shares';

  constructor(private api: ApiService) {}

  index(shoppingListId: number): Promise<User[]> {
    return this.api.get(`${this.prefix}/${shoppingListId}/${this.suffix}`);
  }

  store(shoppingListId: number, email: string): Promise<void> {
    return this.api.post(`${this.prefix}/${shoppingListId}/${this.suffix}`, {
      email
    });
  }

  destroy(shoppingListId: number, email: string): Promise<void> {
    return this.api.delete(
      `${this.prefix}/${shoppingListId}/${this.suffix}/${email}`
    );
  }
}
