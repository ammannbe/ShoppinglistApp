import { Injectable } from '@angular/core';

import { ApiService } from '../api.service';
import { ShoppingList } from 'src/app/services/storage/shopping-list/shopping-list';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private prefix = 'shopping-lists';

  constructor(private api: ApiService) {}

  index(): Promise<ShoppingList[]> {
    return this.api.get<ShoppingList[]>(this.prefix);
  }

  store(shoppingList: ShoppingList): Promise<ShoppingList> {
    return this.api.post<ShoppingList>(this.prefix, shoppingList);
  }

  show(id: number): Promise<ShoppingList> {
    return this.api.get<ShoppingList>(`${this.prefix}/${id}`);
  }

  update(id: number, data: object): Promise<ShoppingList> {
    return this.api.patch<ShoppingList>(`${this.prefix}/${id}`, data);
  }

  destroy(id: number): Promise<ShoppingList> {
    return this.api.delete<ShoppingList>(`${this.prefix}/${id}`);
  }
}
