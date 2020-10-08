import { Injectable } from '@angular/core';
import { validate as isUuid } from 'uuid';
import { SyncService } from '../sync.service';
import { ApiService } from '../../api/api.service';
import { OfflineModeService } from '../../storage/offline-mode/offline-mode.service';
import { ShoppingListService as ApiShoppingListService } from './../../api/shopping-list/shopping-list.service';
import { ShoppingListService as StorageShoppingListService } from './../../storage/shopping-list/shopping-list.service';
import { ShoppingList } from '../../storage/shopping-list/shopping-list';
import { ItemService as StorageItemService } from './../../storage/item/item.service';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListSyncService extends SyncService {
  protected permissions = {
    local: { c: true, r: true, u: true, d: true },
    remote: { c: true, r: true, u: true, d: true }
  };

  constructor(
    protected api: ApiService,
    protected offlineModeService: OfflineModeService,
    private apiShoppingListService: ApiShoppingListService,
    private storageShoppingListService: StorageShoppingListService,
    private storageItemService: StorageItemService
  ) {
    super(api, offlineModeService);
  }

  protected can(action: string, type = 'local'): boolean {
    return this.permissions[type][action];
  }

  protected async getLocalItems(): Promise<ShoppingList[]> {
    return await this.storageShoppingListService.get(true);
  }

  protected async storeLocalItem(item: ShoppingList): Promise<void> {
    this.localChanges = true;
    await this.storageShoppingListService.push(item);
  }

  protected async updateLocalItem(
    item: ShoppingList,
    changes: ShoppingList
  ): Promise<void> {
    if (!item.updated_at || changes.updated_at > item.updated_at) {
      this.localChanges = true;
      await this.storageShoppingListService.updateWithoutTimestamp(
        item,
        changes
      );
    }
  }

  protected async destroyLocalItem(item: ShoppingList): Promise<void> {
    this.localChanges = true;
    const items = await this.storageItemService.get();
    items.forEach(i => {
      if (i.shopping_list_id === item.id) {
        this.storageItemService.remove(i);
      }
    });
    await this.storageShoppingListService.remove(item, true);
  }

  protected async getRemoteItems(): Promise<ShoppingList[]> {
    this.remoteChanges = true;
    return await this.apiShoppingListService.index();
  }

  protected async storeRemoteItem(item: ShoppingList): Promise<ShoppingList> {
    this.remoteChanges = true;
    return await this.apiShoppingListService.store(item);
  }

  protected async destroyRemoteItem(item: ShoppingList): Promise<void> {
    if (!isUuid(item.id.toString())) {
      this.remoteChanges = true;
      await this.apiShoppingListService.destroy(+item.id);
    }
  }

  protected async updateRemoteItem(
    item: ShoppingList,
    changes: ShoppingList
  ): Promise<void> {
    if (item.updated_at < changes.updated_at) {
      this.remoteChanges = true;
      await this.apiShoppingListService.update(+item.id, changes);
    }
  }

  protected async localToRemote(local: ShoppingList[], remote: ShoppingList[]) {
    if (!local.length) {
      return;
    }

    for (const item of local) {
      if (item.deleted_at && this.can('d', 'remote') && this.can('d')) {
        await this.destroyRemoteItem(item);
        await this.destroyLocalItem(item);
        continue;
      }

      if (
        isUuid(item.id.toString()) &&
        this.can('c', 'remote') &&
        this.can('u')
      ) {
        const changes = await this.storeRemoteItem(item);
        await this.updateLocalItem(item, changes);
        continue;
      }

      if (typeof item.id === 'number') {
        const found = remote.find(i => i.id === item.id);
        if (found && this.can('u', 'remote')) {
          await this.updateRemoteItem(found, item);
        } else if (!found && this.can('d')) {
          await this.destroyLocalItem(item);
        }
        continue;
      }
    }
  }

  protected async remoteToLocal(remote: ShoppingList[], local: ShoppingList[]) {
    if (!remote.length) {
      return;
    }

    for (const item of remote) {
      const found = local.find(i => i.id === item.id);

      if (!found && this.can('c')) {
        await this.storeLocalItem(item);
      } else if (found && this.can('u')) {
        await this.updateLocalItem(found, item);
      }
    }
  }
}
