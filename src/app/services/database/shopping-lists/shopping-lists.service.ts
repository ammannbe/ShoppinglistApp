import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { DbService } from '../_base/db.service';
import { QueriesService } from '../_base/queries.service';
import { ShoppingList } from './shopping-list';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListsService extends DbService {
  protected table = 'shopping_lists';

  constructor(protected sqlite: SQLite, protected queries: QueriesService) {
    super(sqlite, queries);
  }

  public async select<ShoppingList = any>(
    where: any = {},
    withTrashed: boolean = false
  ): Promise<ShoppingList[]> {
    return super.select<ShoppingList>(where, withTrashed);
  }

  public async find<ShoppingList = any>(id: number): Promise<ShoppingList> {
    return super.find<ShoppingList>(id);
  }

  public async findByRemoteId<ShoppingList = any>(
    id: number
  ): Promise<ShoppingList> {
    return super.findByRemoteId<ShoppingList>(id);
  }

  public async insert(shoppingList: ShoppingList): Promise<void> {
    super.insert(shoppingList, !this.resourceIsRemote(shoppingList));
  }

  public async update(id: number, shoppingList: ShoppingList): Promise<void> {
    super.update(id, shoppingList, !this.resourceIsRemote(shoppingList));
  }
}
