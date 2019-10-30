import { Injectable } from '@angular/core';

import { ProductsService as DbProductService } from '../../services/database/products/products.service';
import { ProductsService as ApiProductService } from '../../services/api/products/products.service';
import { Product as DbProduct } from 'src/app/services/database/products/product';
import { Product as ApiProduct } from 'src/app/services/api/products/product';
import { SyncHelperService } from 'src/app/services/api/sync-helper.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private dbChanges = true;
  private apiChanges = true;

  constructor(
    private syncHelper: SyncHelperService,
    private dbProductService: DbProductService,
    private apiProductService: ApiProductService
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
    let dbItems = await this.dbProductService.select(true);
    let apiItems = await this.apiProductService.index().toPromise();
    await this.syncLocalToRemote(dbItems, apiItems);
    if (this.dbChanges) {
      dbItems = await this.dbProductService.select(true);
    }
    if (this.apiChanges) {
      apiItems = await this.apiProductService.index().toPromise();
    }
    await this.syncRemoteToLocal(apiItems, dbItems);

    this.syncHelper.stopSync();
  }

  private async syncLocalToRemote(
    localItems: DbProduct[],
    remoteItems: ApiProduct[]
  ) {
    if (!localItems.length) {
      return;
    }

    for (const localItem of localItems) {
      const found = this.syncHelper.searchBy(
        'name',
        remoteItems,
        localItem.name
      ) as ApiProduct;
      if (!found) {
        this.apiChanges = true;
        await this.apiProductService.store(found).toPromise();
      }
      continue;
    }
  }

  private async syncRemoteToLocal(
    remoteItems: ApiProduct[],
    localItems: DbProduct[]
  ) {
    if (!remoteItems.length) {
      return;
    }

    for (const remoteItem of remoteItems) {
      const found = this.syncHelper.searchBy(
        'name',
        localItems,
        remoteItem.name
      ) as DbProduct;
      if (!found) {
        this.dbChanges = true;
        await this.dbProductService.insert(remoteItem as DbProduct);
      }
    }
  }
}
