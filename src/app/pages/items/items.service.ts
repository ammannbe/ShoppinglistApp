import { Injectable } from '@angular/core';

import { ItemsService as DbItemService } from '../../services/database/items/items.service';
import { ShoppingListsService as DbShoppingListService } from 'src/app/services/database/shopping-lists/shopping-lists.service';
import { SyncService } from './sync.service';
import { Item } from 'src/app/services/database/items/item';
import { ShoppingList } from 'src/app/services/database/shopping-lists/shopping-list';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  constructor(
    private syncService: SyncService,
    private dbItem: DbItemService,
    private dbShoppingList: DbShoppingListService
  ) {}

  async find(id: number): Promise<Item> {
    const item = await this.dbItem.find(id);
    const shoppingList = await this.dbShoppingList.find(item.shopping_list_id);
    await this.syncService.sync(shoppingList);
    return item;
  }

  async index(shoppingList: ShoppingList, forceSync: boolean = false): Promise<Item[]> {
    await this.syncService.sync(shoppingList, forceSync);
    return this.dbItem.select(shoppingList.id);
  }

  async insert(shoppingList: ShoppingList, item: Item): Promise<void> {
    await this.dbItem.insert(item);
    await this.syncService.sync(shoppingList);
  }

  async update(id: number, shoppingList: ShoppingList, item: Item): Promise<void> {
    delete item.remote_id;
    item.remote_id = null;
    await this.dbItem.update(id, item);
    await this.syncService.sync(shoppingList);
  }

  async destroy(shoppingList: ShoppingList, item: Item): Promise<void> {
    delete item.remote_id;
    item.remote_id = null;
    await this.dbItem.delete(item.id);
    await this.syncService.sync(shoppingList);
  }
}
