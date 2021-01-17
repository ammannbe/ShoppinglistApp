import { Injectable } from '@angular/core';
import { validate as isUuid } from 'uuid';
import { SyncService } from '../sync.service';
import { ApiService } from '../../api/api.service';
import { OfflineModeService } from '../../storage/offline-mode/offline-mode.service';
import { ItemService as ApiItemService } from './../../api/item/item.service';
import { ItemService as StorageItemService } from './../../storage/item/item.service';
import { Item } from '../../storage/item/item';

@Injectable({
  providedIn: 'root'
})
export class ItemSyncService extends SyncService {
  protected permissions = {
    local: { c: true, r: true, u: true, d: true },
    remote: { c: true, r: true, u: true, d: true }
  };
  protected shoppingListId: number | string;

  constructor(
    protected api: ApiService,
    protected offlineModeService: OfflineModeService,
    private apiItemService: ApiItemService,
    private storageItemService: StorageItemService
  ) {
    super(api, offlineModeService);
  }

  public setShoppingListId(shoppingListId: number | string): void {
    this.shoppingListId = shoppingListId;
  }

  protected can(action: string, type = 'local'): boolean {
    return this.permissions[type][action];
  }

  protected async getLocalItems(): Promise<Item[]> {
    return await this.storageItemService.searchByShoppingList(
      this.shoppingListId
    );
  }

  protected async storeLocalItem(item: Item): Promise<void> {
    this.localChanges = true;
    await this.storageItemService.push(item);
  }

  protected async updateLocalItem(item: Item, changes: Item): Promise<void> {
    if (!item.updated_at || item.updated_at < changes.updated_at) {
      this.localChanges = true;
      await this.storageItemService.updateWithoutTimestamp(item, changes);
    }
  }

  protected async destroyLocalItem(item: Item): Promise<void> {
    this.localChanges = true;
    await this.storageItemService.remove(item, true);
  }

  protected async getRemoteItems(): Promise<Item[]> {
    this.remoteChanges = true;
    return await this.apiItemService.index(+this.shoppingListId);
  }

  protected async storeRemoteItem(item: Item): Promise<Item> {
    this.remoteChanges = true;
    return await this.apiItemService.store(item, +this.shoppingListId);
  }

  protected async destroyRemoteItem(item: Item): Promise<void> {
    if (!isUuid(item.id.toString())) {
      this.remoteChanges = true;
      try {
        await this.apiItemService.destroy(item.id);
      } catch (error) {
        if (error.status === 404) {
          return;
        }

        throw error;
      }
    }
  }

  protected async updateRemoteItem(item: Item, changes: Item): Promise<void> {
    if (item.updated_at < changes.updated_at) {
      this.remoteChanges = true;
      await this.apiItemService.update(item.id, changes);
    }
  }

  public async sync(onlyPush = false): Promise<void> {
    if (!this.shoppingListId || isUuid(this.shoppingListId.toString())) {
      return;
    }

    return await super.sync(onlyPush);
  }

  protected async localToRemote(local: Item[], remote: Item[]) {
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

  protected async remoteToLocal(remote: Item[], local: Item[]) {
    if (!remote.length) {
      return;
    }

    for (const item of remote) {
      const found = local.find(i => i.id === item.id);

      if (found && this.can('u')) {
        await this.updateLocalItem(found, item);
      } else if (!found && this.can('u')) {
        item.shopping_list_id = this.shoppingListId;
        await this.storeLocalItem(item);
      }
    }
  }
}
