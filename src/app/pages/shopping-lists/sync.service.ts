import { Injectable } from '@angular/core';

import { ShoppingListsService as DbShoppingListService } from '../../services/database/shopping-lists/shopping-lists.service';
import { ShoppingListsService as ApiShoppingListService } from '../../services/api/shopping-lists/shopping-lists.service';
import { ShoppingList as DbShoppingList } from 'src/app/services/database/shopping-lists/shopping-list';
import { ShoppingList as ApiShoppingList } from 'src/app/services/api/shopping-lists/shopping-list';
import { SyncHelperService } from 'src/app/services/api/sync-helper.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private dbChanges = false;
  private apiChanges = false;

  constructor(
    private syncHelper: SyncHelperService,
    private dbShoppingListService: DbShoppingListService,
    private apiShoppingListService: ApiShoppingListService
  ) {}

  async sync(forceSync: boolean = false): Promise<void> {
    if (this.syncHelper.syncHasStarted()) {
      return;
    }

    this.syncHelper.startSync();
    if (!(await this.syncHelper.canSync(forceSync))) {
      this.syncHelper.stopSync();
      return;
    }

    this.dbChanges = this.apiChanges = false;

    let dbItems = await this.dbShoppingListService.select(true);
    let apiItems = await this.apiShoppingListService.index().toPromise();
    await this.syncLocalToRemote(dbItems, apiItems);
    if (this.dbChanges) {
      dbItems = await this.dbShoppingListService.select(true);
    }
    if (this.apiChanges) {
      apiItems = await this.apiShoppingListService.index().toPromise();
    }
    await this.syncRemoteToLocal(apiItems, dbItems);

    this.syncHelper.stopSync();
  }

  private async syncLocalToRemote(
    localItems: DbShoppingList[],
    remoteItems: ApiShoppingList[]
  ) {
    if (!localItems.length) {
      return;
    }

    for (const localItem of localItems) {
      if (localItem.deleted_at) {
        if (localItem.remote_id) {
          this.apiChanges = true;
          await this.apiShoppingListService
            .destroy(localItem.remote_id)
            .toPromise();
        }
        this.dbChanges = true;
        await this.dbShoppingListService.forceDelete(localItem.id);
        continue;
      }

      if (!localItem.remote_id) {
        this.apiChanges = true;
        const remoteItem = (await this.apiShoppingListService
          .store(localItem)
          .toPromise()) as DbShoppingList;
        this.dbChanges = true;
        remoteItem.remote_id = remoteItem.id;
        await this.dbShoppingListService.update(localItem.id, remoteItem);
        continue;
      }

      if (localItem.remote_id) {
        const remoteItem = this.syncHelper.searchBy(
          'id',
          remoteItems,
          localItem.remote_id
        ) as ApiShoppingList;
        if (remoteItem && localItem.updated_at > remoteItem.updated_at) {
          this.apiChanges = true;
          await this.apiShoppingListService
            .update(localItem.remote_id, localItem)
            .toPromise();
        }
        continue;
      }
    }
  }

  private async syncRemoteToLocal(
    remoteItems: ApiShoppingList[],
    localItems: DbShoppingList[]
  ) {
    if (!remoteItems.length) {
      return;
    }
    for (const remoteItem of remoteItems) {
      const found = this.syncHelper.searchBy(
        'remote_id',
        localItems,
        remoteItem.id
      ) as DbShoppingList;
      const localItem = remoteItem as DbShoppingList;
      localItem.remote_id = localItem.id;
      localItem.id = null;
      if (!found) {
        this.dbChanges = true;
        await this.dbShoppingListService.insert(localItem);
      } else if (remoteItem.updated_at > found.updated_at) {
        this.dbChanges = true;
        await this.dbShoppingListService.update(found.id, localItem);
      }
    }
  }
}
