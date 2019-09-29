import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ShoppingListsService as DbShoppingListService } from '../../services/database/shopping-lists/shopping-lists.service';
import { ShoppingListsService as ApiShoppingListService } from '../../services/api/shopping-lists/shopping-lists.service';
import { ApiService } from 'src/app/services/api/api.service';
import { ShoppingList } from './shopping-list';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListsService {
  private syncIsRunning = false;

  constructor(
    private apiService: ApiService,
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
    const hasConnection = await this.apiService.hasConnection();
    if (hasConnection.status !== 418) {
      console.log('No connection.');
      return;
    }

    this.syncIsRunning = true;
    const localSL1 = await this.dbShoppingList.select(true);
    const remoteSL1 = await this.apiShoppingList.index().toPromise();
    await this.syncLocalToRemote(localSL1, remoteSL1);

    const localSL2 = await this.dbShoppingList.select(true);
    const remoteSL2 = await this.apiShoppingList.index().toPromise();
    await this.syncRemoteToLocal(remoteSL2, localSL2);
    this.syncIsRunning = false;
  }

  private async syncLocalToRemote(
    localShoppingLists: ShoppingList[],
    remoteShoppingLists: ShoppingList[]
  ) {
    if (!localShoppingLists.length) {
      return;
    }
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
    if (!remoteShoppingLists.length) {
      return;
    }
    for (const shoppingList of remoteShoppingLists) {
      const found = localShoppingLists.find(o => {
        return o.remote_id === shoppingList.id;
      });
      if (found) {
        let name = shoppingList.name;
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
