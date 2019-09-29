import { Injectable } from '@angular/core';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  public syncIsRunning = false;
  private attributes: any[];
  private dbService: any;
  private apiService: any;

  constructor(private api: ApiService) {}

  setServices(dbService: any, apiService: any) {
    this.dbService = dbService;
    this.apiService = apiService;
  }

  setAttributes(attributes: any[]) {
    this.attributes = attributes;
  }

  async sync(): Promise<void> {
    if (this.syncIsRunning) {
      return;
    }

    this.syncIsRunning = true;

    const connection = await this.api.checkConnection();
    if (connection.status !== 418) {
      console.log('No connection.');
      this.syncIsRunning = false;
      return;
    }

    await this.syncLocalToRemote(
      await this.dbService.select(true),
      await this.apiService.index().toPromise()
    );

    await this.syncRemoteToLocal(
      await this.apiService.index().toPromise(),
      await this.dbService.select(true)
    );

    this.syncIsRunning = false;
  }

  private async syncLocalToRemote(localItems: any[], remoteItems: any[]) {
    if (!localItems.length) {
      return;
    }

    for (const localItem of localItems) {
      if (!localItem.remote_id && !localItem.deleted_at) {
        const attributes = [];
        for (const attribute of this.attributes) {
          attributes.push(localItem[attribute]);
        }
        const tmpS = await this.apiService.store(...attributes).toPromise();
        await this.dbService.update(localItem.id, ...attributes, tmpS);
      }

      if (localItem.deleted_at) {
        await this.dbService.forceDelete(localItem.id);

        if (localItem.remote_id) {
          await this.apiService.destroy(localItem.remote_id).toPromise();
        }
      }

      if (localItem.remote_id && !localItem.deleted_at) {
        const found = remoteItems.find(o => {
          return o.id === localItem.remote_id;
        });
        if (found) {
          await this.apiService
            .update(localItem.remote_id, localItem.name)
            .toPromise();
        }
      }
    }
  }

  private async syncRemoteToLocal(remoteItems: any[], localItems: any[]) {
    if (!remoteItems.length) {
      return;
    }
    for (const remoteItem of remoteItems) {
      const found = localItems.find(o => {
        return o.remote_id === remoteItem.id;
      });
      if (found) {
        const attributes = [];
        for (const attribute of this.attributes) {
          if (found.updated_at > remoteItem.updated_at) {
            attributes.push(found[attribute]);
          } else {
            attributes.push(remoteItem[attribute]);
          }
        }
        await this.dbService.update(found.id, ...attributes);
      } else {
        const attributes = [];
        for (const attribute of this.attributes) {
          attributes.push(remoteItem[attribute]);
        }
        await this.dbService.insert(...attributes, remoteItem.id);
      }
    }
  }
}
