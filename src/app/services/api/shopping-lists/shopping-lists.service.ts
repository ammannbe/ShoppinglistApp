import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api.service';
import { ShoppingList } from './shopping-list';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListsService {
  private prefix = '/shopping-lists';

  constructor(private api: ApiService) {}

  index(): Observable<ShoppingList[]> {
    return this.api.get<ShoppingList[]>(this.prefix);
  }

  store(shoppingList: ShoppingList): Observable<ShoppingList> {
    return this.api.post<ShoppingList>(this.prefix, shoppingList);
  }

  show(id: number): Observable<ShoppingList> {
    return this.api.get<ShoppingList>(`${this.prefix}/${id}`);
  }

  update(id: number, data: object): Observable<ShoppingList> {
    return this.api.patch<ShoppingList>(`${this.prefix}/${id}`, data);
  }

  destroy(id: number) {
    return this.api.delete(`${this.prefix}/${id}`);
  }
}
