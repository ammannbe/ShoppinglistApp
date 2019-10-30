import { Injectable } from '@angular/core';

import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListSharesService {
  private prefix = '/shopping-lists';
  private suffix = 'shares';

  constructor(private api: ApiService) {}

  async index(shoppingListId: number): Promise<any> {
    return await this.api.get(`${this.prefix}/${shoppingListId}/${this.suffix}`).toPromise();
  }

  async store(shoppingListId: number, email: string): Promise<any> {
    return await this.api.post(`${this.prefix}/${shoppingListId}/${this.suffix}`, { email }).toPromise();
  }

  async destroy(shoppingListId: number, email: string): Promise<any> {
    return await this.api.delete(`${this.prefix}/${shoppingListId}/${this.suffix}/${email}`).toPromise();
  }
}
