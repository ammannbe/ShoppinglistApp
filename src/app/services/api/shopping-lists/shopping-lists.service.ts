import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api.service';
import { ShoppingList } from 'src/app/pages/shopping-lists/shopping-list';
import { Item } from 'src/app/pages/items/item';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListsService {
  private prefix = '/shopping-lists';

  constructor(private api: ApiService) {}

  index(): Observable<ShoppingList[]> {
    return this.api.get<ShoppingList[]>(this.prefix);
  }

  store(name: string): Observable<ShoppingList> {
    return this.api.post<ShoppingList>(this.prefix, { name });
  }

  show(id: number): Observable<ShoppingList> {
    return this.api.get<ShoppingList>(`${this.prefix}/${id}`);
  }

  update(id: number, name: string): Observable<ShoppingList> {
    return this.api.patch<ShoppingList>(`${this.prefix}/${id}`, { name });
  }

  destroy(id: number) {
    return this.api.delete(`${this.prefix}/${id}`);
  }

  items(shoppingListId: number): Observable<Item[]> {
    return this.api.get<Item[]>(`${this.prefix}/${shoppingListId}/items`);
  }

  share(shoppingListId: number, email: string): Observable<any> {
    return this.api.post(`${this.prefix}/${shoppingListId}/users`, { email });
  }
}
