import { Injectable } from '@angular/core';

import { ItemsService as DbItemService } from '../../services/database/items/items.service';
import { ItemsService as ApiItemService } from '../../services/api/items/items.service';
import { ShoppingList } from 'src/app/services/database/shopping-lists/shopping-list';
import { Item as DbItem } from 'src/app/services/database/items/item';
import { Item as ApiItem } from 'src/app/services/api/items/item';
import { SyncHelperService } from 'src/app/services/api/sync-helper.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private shoppingList: ShoppingList;
  private dbChanges = true;
  private apiChanges = true;

  constructor(
    private syncHelper: SyncHelperService,
    private dbItemService: DbItemService,
    private apiItemService: ApiItemService
  ) {}

  async sync(
    shoppingList: ShoppingList,
    forceSync: boolean = false
  ): Promise<void> {
    if (this.syncHelper.syncHasStarted()) {
      return;
    }

    this.syncHelper.startSync();

    if (
      !(await this.syncHelper.canSync(forceSync)) ||
      !shoppingList.remote_id
    ) {
      this.syncHelper.stopSync();
      return;
    }

    this.dbChanges = this.apiChanges = false;
    this.shoppingList = shoppingList;
    let dbItems = await this.dbItemService.select(this.shoppingList.id, true);
    let apiItems = await this.apiItemService
      .index(this.shoppingList.remote_id)
      .toPromise();
    await this.syncLocalToRemote(dbItems, apiItems);
    if (this.dbChanges) {
      dbItems = await this.dbItemService.select(this.shoppingList.id, true);
    }
    if (this.apiChanges) {
      apiItems = await this.apiItemService
        .index(this.shoppingList.remote_id)
        .toPromise();
    }
    await this.syncRemoteToLocal(apiItems, dbItems);

    this.syncHelper.stopSync();
  }

  private async syncLocalToRemote(
    localItems: DbItem[],
    remoteItems: ApiItem[]
  ) {
    if (!localItems.length) {
      return;
    }

    for (const localItem of localItems) {
      if (localItem.deleted_at) {
        if (localItem.remote_id) {
          this.apiChanges = true;
          await this.apiItemService.destroy(localItem.remote_id).toPromise();
        }
        this.dbChanges = true;
        await this.dbItemService.forceDelete(localItem.id);
        continue;
      }

      if (!localItem.remote_id) {
        this.apiChanges = true;
        const remoteItem = (await this.apiItemService
          .store(localItem, this.shoppingList.remote_id)
          .toPromise()) as DbItem;
        this.dbChanges = true;
        remoteItem.remote_id = remoteItem.id;
        await this.dbItemService.update(localItem.id, remoteItem);
        continue;
      }

      if (localItem.remote_id) {
        const remoteItem = this.syncHelper.searchBy(
          'id',
          remoteItems,
          localItem.remote_id
        ) as ApiItem;
        if (remoteItem && localItem.updated_at > remoteItem.updated_at) {
          this.apiChanges = true;
          await this.apiItemService
            .update(localItem.remote_id, localItem)
            .toPromise();
        }
        continue;
      }
    }
  }

  private async syncRemoteToLocal(
    remoteItems: ApiItem[],
    localItems: DbItem[]
  ) {
    if (!remoteItems.length) {
      return;
    }
    for (const remoteItem of remoteItems) {
      const found = this.syncHelper.searchBy(
        'remote_id',
        localItems,
        remoteItem.id
      ) as DbItem;
      const localItem = remoteItem as DbItem;
      localItem.remote_id = localItem.id;
      localItem.shopping_list_id = this.shoppingList.id;
      localItem.id = null;
      if (!found) {
        this.dbChanges = true;
        await this.dbItemService.insert(localItem);
      } else if (remoteItem.updated_at > found.updated_at) {
        this.dbChanges = true;
        await this.dbItemService.update(found.id, localItem);
      }
    }
  }
}
