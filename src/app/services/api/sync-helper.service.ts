import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { OfflineModeService } from '../storage/offline-mode/offline-mode.service';

@Injectable({
  providedIn: 'root'
})
export class SyncHelperService {
  private syncIsRunning = false;
  private numberOfSyncs = -10; // Sync first 10 actions anyway

  constructor(
    private api: ApiService,
    private offlineModeService: OfflineModeService
  ) {}

  async canSync(force: boolean = false): Promise<boolean> {
    if (!force && this.numberOfSyncs >= 0 && this.numberOfSyncs % 2 !== 0) {
      return false;
    }

    if (await this.offlineModeService.enabled()) {
      return false;
    }

    if (await this.api.checkConnection()) {
      return true;
    }

    return false;
  }

  startSync() {
    this.syncIsRunning = true;
    setTimeout(() => {
      this.stopSync();
    }, 300000); // timeout after 5min
  }

  stopSync() {
    this.syncIsRunning = false;
    this.numberOfSyncs++;
  }

  syncHasStarted(): boolean {
    return this.syncIsRunning;
  }

  searchBy(attribute: string, resources: any[], value: any): any {
    return resources.find(o => {
      return o[attribute] === value;
    });
  }
}
