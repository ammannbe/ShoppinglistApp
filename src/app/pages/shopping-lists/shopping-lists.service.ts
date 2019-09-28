import { Injectable } from '@angular/core';

import { ShoppingListsService as DbShoppingListService } from '../../services/database/shopping-lists/shopping-lists.service';
import { ShoppingListsService as ApiShoppingListService } from '../../services/api/shopping-lists/shopping-lists.service';
import { ShoppingList } from './shopping-list';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListsService {
  constructor(
    private dbShoppingList: DbShoppingListService,
    private apiShoppingList: ApiShoppingListService
  ) {}

  async index(): Promise<ShoppingList[]> {
    await this.sync();
    return this.dbShoppingList.select();
  }

  async insert(name: string): Promise<void> {
    await this.dbShoppingList.insert(name);
    await this.sync();
  }

  async update(id: number, name: string): Promise<void> {
    await this.sync();
    await this.dbShoppingList.update(id, name);
  }

  async destroy(id: number): Promise<void> {
    await this.sync();
    await this.dbShoppingList.delete(id);
  }

  share(id: number, email: string): Observable<any> {
    return this.apiShoppingList.share(id, email);
  }

  async sync(): Promise<void> {
    //
  }
}
