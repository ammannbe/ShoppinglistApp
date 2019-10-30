import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api.service';
import { Item } from './item';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private prefix = '/items';

  constructor(private api: ApiService) {}

  index(shoppingListId: number): Observable<Item[]> {
    return this.api.get<Item[]>(
      `/shopping-lists/${shoppingListId}${this.prefix}`
    );
  }

  store(item: Item, shoppingListId: number): Observable<Item> {
    item.shopping_list_id = shoppingListId;
    return this.api.post<Item>(
      `/shopping-lists/${shoppingListId}${this.prefix}`,
      item
    );
  }

  show(id: number): Observable<Item> {
    return this.api.get<Item>(`${this.prefix}/${id}`);
  }

  update(id: number, data: any): Observable<Item> {
    delete data.shopping_list_id;
    return this.api.patch<Item>(`${this.prefix}/${id}`, data);
  }

  destroy(id: number) {
    return this.api.delete(`${this.prefix}/${id}`);
  }
}
