import { Injectable } from '@angular/core';

import { ShoppingListsService as DbShoppingListService } from '../../services/database/shopping-lists/shopping-lists.service';
import { SyncService } from './sync.service';
import { ShoppingList } from 'src/app/services/database/shopping-lists/shopping-list';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListsService {
  constructor(
    private syncService: SyncService,
    private dbShoppingList: DbShoppingListService
  ) {}

  async find(id: number): Promise<ShoppingList> {
    await this.syncService.sync();
    return this.dbShoppingList.find(id);
  }

  async index(forceSync: boolean = false): Promise<ShoppingList[]> {
    await this.syncService.sync(forceSync);
    return this.dbShoppingList.select();
  }

  async insert(shoppingList: ShoppingList): Promise<void> {
    await this.dbShoppingList.insert(shoppingList);
    await this.syncService.sync();
  }

  async update(id: number, shoppingList: ShoppingList): Promise<void> {
    await this.dbShoppingList.update(id, shoppingList);
    await this.syncService.sync();
  }

  async destroy(id: number): Promise<void> {
    await this.dbShoppingList.delete(id);
    await this.syncService.sync();
  }
}
