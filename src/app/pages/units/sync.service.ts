import { Injectable } from '@angular/core';

import { UnitsService as DbUnitService } from '../../services/database/units/units.service';
import { UnitsService as ApiUnitService } from '../../services/api/units/units.service';
import { Unit as DbUnit } from 'src/app/services/database/units/unit';
import { Unit as ApiUnit } from 'src/app/services/api/units/unit';
import { SyncHelperService } from 'src/app/services/api/sync-helper.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private dbChanges = true;
  private apiChanges = true;

  constructor(
    private syncHelper: SyncHelperService,
    private dbUnitService: DbUnitService,
    private apiUnitService: ApiUnitService
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
    let dbItems = await this.dbUnitService.select(true);
    let apiItems = await this.apiUnitService.index().toPromise();
    await this.syncLocalToRemote(dbItems, apiItems);
    if (this.dbChanges) {
      dbItems = await this.dbUnitService.select(true);
    }
    if (this.apiChanges) {
      apiItems = await this.apiUnitService.index().toPromise();
    }
    await this.syncRemoteToLocal(apiItems, dbItems);

    this.syncHelper.stopSync();
  }

  private async syncLocalToRemote(
    localItems: DbUnit[],
    remoteItems: ApiUnit[]
  ) {
    if (!localItems.length) {
      return;
    }

    for (const localItem of localItems) {
      const found = this.syncHelper.searchBy(
        'name',
        remoteItems,
        localItem.name
      ) as ApiUnit;
      if (!found) {
        this.apiChanges = true;
        await this.apiUnitService.store(found).toPromise();
      }
      continue;
    }
  }

  private async syncRemoteToLocal(
    remoteItems: ApiUnit[],
    localItems: DbUnit[]
  ) {
    if (!remoteItems.length) {
      return;
    }

    for (const remoteItem of remoteItems) {
      const found = this.syncHelper.searchBy(
        'name',
        localItems,
        remoteItem.name
      ) as DbUnit;
      if (!found) {
        this.dbChanges = true;
        await this.dbUnitService.insert(remoteItem as DbUnit);
      }
    }
  }
}
