import { Injectable } from '@angular/core';

import { ShoppingListsService as DbShoppingListService } from '../../services/database/shopping-lists/shopping-lists.service';
import { ShoppingListsService as ApiShoppingListService } from '../../services/api/shopping-lists/shopping-lists.service';
import { ShoppingList } from './shopping-list';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListsService {
  private syncIsRunning = false;

  constructor(
    private dbShoppingList: DbShoppingListService,
    private apiShoppingList: ApiShoppingListService
  ) {}

  async index(): Promise<ShoppingList[]> {
    if (!this.syncIsRunning) {
      await this.sync();
    }
    return this.dbShoppingList.select();
  }

  async insert(name: string): Promise<void> {
    await this.dbShoppingList.insert(name);
    if (!this.syncIsRunning) {
      await this.sync();
    }
  }

  async update(id: number, name: string): Promise<void> {
    await this.dbShoppingList.update(id, name);
    if (!this.syncIsRunning) {
      await this.sync();
    }
  }

  async destroy(id: number): Promise<void> {
    if (!this.syncIsRunning) {
      await this.sync();
    }
    await this.dbShoppingList.delete(id);
  }

  share(id: number, email: string): Observable<any> {
    return this.apiShoppingList.share(id, email);
  }

  async sync(): Promise<void> {
    this.syncIsRunning = true;
    const localShoppingLists = await this.dbShoppingList.select(true);
    const remoteShoppingLists = await this.apiShoppingList.index().toPromise();

    await this.syncLocalToRemote(localShoppingLists, remoteShoppingLists);
    await this.syncRemoteToLocal(remoteShoppingLists, localShoppingLists);
    this.syncIsRunning = false;
  }

  private async syncLocalToRemote(
    localShoppingLists: ShoppingList[],
    remoteShoppingLists: ShoppingList[]
  ) {
    for (const shoppingList of localShoppingLists) {
      if (!shoppingList.remote_id && !shoppingList.deleted_at) {
        const tmpS = await this.apiShoppingList
          .store(shoppingList.name)
          .toPromise();
        await this.dbShoppingList.update(
          shoppingList.id,
          shoppingList.name,
          tmpS
        );
      }

      if (shoppingList.deleted_at) {
        await this.dbShoppingList.forceDelete(shoppingList.id);

        if (shoppingList.remote_id) {
          await this.apiShoppingList
            .destroy(shoppingList.remote_id)
            .toPromise();
        }
      }

      if (shoppingList.remote_id && !shoppingList.deleted_at) {
        const found = remoteShoppingLists.find(o => {
          return o.id === shoppingList.remote_id;
        });
        if (found) {
          await this.apiShoppingList
            .update(shoppingList.remote_id, shoppingList.name)
            .toPromise();
        }
      }
    }
  }

  private async syncRemoteToLocal(
    remoteShoppingLists: ShoppingList[],
    localShoppingLists: ShoppingList[]
  ) {
    for (const shoppingList of remoteShoppingLists) {
      const found = localShoppingLists.find(o => {
        return o.remote_id === shoppingList.id;
      });
      if (found) {
        let name = shoppingList.name;
        console.log(found.updated_at);
        console.log(shoppingList.updated_at);
        if (found.updated_at > shoppingList.updated_at) {
          name = found.name;
        }
        await this.dbShoppingList.update(found.id, name);
      } else {
        await this.dbShoppingList.insert(shoppingList.name, shoppingList.id);
      }
    }
  }
}
