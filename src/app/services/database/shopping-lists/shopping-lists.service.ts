import { Injectable } from '@angular/core';

import { DbService } from '../_base/db.service';
import { ShoppingList } from './shopping-list';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListsService {
  private table = 'shopping_lists';

  constructor(private db: DbService) {}

  use() {
    this.db.use(this.table);
  }

  private isRemote(shoppingList: ShoppingList) {
    return !shoppingList.remote_id ? false : true;
  }

  async select(withTrashed: boolean = false): Promise<ShoppingList[]> {
    this.use();
    return this.db.select<ShoppingList>(null, withTrashed);
  }

  async find(id: number): Promise<ShoppingList> {
    this.use();
    return this.db.find<ShoppingList>(id);
  }

  async findByRemoteId(id: number): Promise<ShoppingList> {
    this.use();
    return this.db.findByRemoteId<ShoppingList>(id);
  }

  async insert(shoppingList: ShoppingList): Promise<void> {
    this.use();
    this.db.insert(shoppingList, !this.isRemote(shoppingList));
  }

  async update(id: number, shoppingList: ShoppingList): Promise<void> {
    this.use();
    this.db.update(id, shoppingList, !this.isRemote(shoppingList));
  }

  async delete(id: number): Promise<void> {
    this.use();
    this.db.delete(id);
  }

  async forceDelete(id: number): Promise<void> {
    this.use();
    this.db.forceDelete(id);
  }

  async truncate(): Promise<void> {
    this.use();
    this.db.truncate();
  }
}
