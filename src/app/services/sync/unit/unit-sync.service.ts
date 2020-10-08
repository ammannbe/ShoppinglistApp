import { Injectable } from '@angular/core';
import { SyncService } from '../sync.service';
import { ApiService } from '../../api/api.service';
import { OfflineModeService } from '../../storage/offline-mode/offline-mode.service';
import { UnitService as ApiUnitService } from './../../api/unit/unit.service';
import { UnitService as StorageUnitService } from './../../storage/unit/unit.service';
import { Unit } from '../../storage/unit/unit';

@Injectable({
  providedIn: 'root'
})
export class UnitSyncService extends SyncService {
  constructor(
    protected api: ApiService,
    protected offlineModeService: OfflineModeService,
    private apiUnitService: ApiUnitService,
    private storageUnitService: StorageUnitService
  ) {
    super(api, offlineModeService);
  }

  protected async getLocalItems(): Promise<Unit[]> {
    return await this.storageUnitService.get(true);
  }

  protected async storeLocalItem(item: Unit): Promise<void> {
    await this.storageUnitService.push(item);
  }

  protected async getRemoteItems(): Promise<Unit[]> {
    return await this.apiUnitService.index();
  }

  protected async storeRemoteItem(item: Unit): Promise<void> {
    await this.apiUnitService.store(item);
  }
}
