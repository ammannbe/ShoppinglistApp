import { Injectable } from '@angular/core';

import { ApiService } from '../api.service';
import { Item } from '../../storage/item/item';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private prefix = 'items';

  constructor(private api: ApiService) {}

  index(shoppingListId: number): Promise<Item[]> {
    return this.api.get<Item[]>(
      `shopping-lists/${shoppingListId}/${this.prefix}`
    );
  }

  store(item: Item, shoppingListId: number): Promise<Item> {
    item.shopping_list_id = shoppingListId;
    return this.api.post<Item>(
      `shopping-lists/${shoppingListId}/${this.prefix}`,
      item
    );
  }

  show(id: number): Promise<Item> {
    return this.api.get<Item>(`${this.prefix}/${id}`);
  }

  update(id: number | string, data: any): Promise<Item> {
    delete data.shopping_list_id;
    return this.api.patch<Item>(`${this.prefix}/${id}`, data);
  }

  destroy(id: number | string) {
    return this.api.delete(`${this.prefix}/${id}`);
  }
}
