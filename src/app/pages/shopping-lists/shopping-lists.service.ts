import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ShoppingListsService as DbShoppingListService } from '../../services/database/shopping-lists/shopping-lists.service';
import { ShoppingListsService as ApiShoppingListService } from '../../services/api/shopping-lists/shopping-lists.service';
import { ShoppingList } from './shopping-list';
import { SyncService } from 'src/app/services/api/sync.service';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListsService {
  constructor(
    private syncService: SyncService,
    private dbShoppingList: DbShoppingListService,
    private apiShoppingList: ApiShoppingListService
  ) {
    this.syncService.setServices(this.dbShoppingList, this.apiShoppingList);
    this.syncService.setAttributes(['name']);
  }

  async index(): Promise<ShoppingList[]> {
    await this.syncService.sync();
    return this.dbShoppingList.select();
  }

  async insert(name: string): Promise<void> {
    await this.dbShoppingList.insert(name);
    await this.syncService.sync();
  }

  async update(id: number, name: string): Promise<void> {
    await this.dbShoppingList.update(id, name);
    await this.syncService.sync();
  }

  async destroy(id: number): Promise<void> {
    await this.syncService.sync();
    await this.dbShoppingList.delete(id);
  }

  share(id: number, email: string): Observable<any> {
    return this.apiShoppingList.share(id, email);
  }
}
