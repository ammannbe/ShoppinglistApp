import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { UserService } from '../database/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class SyncHelperService {
  private syncIsRunning = false;
  private numberOfSyncs = -10; // Sync first 10 actions anyway
  private offlineOnly: boolean = null;

  constructor(private api: ApiService, private userService: UserService) {}

  async canSync(force: boolean = false): Promise<boolean> {
    if (this.offlineOnly === null) {
      this.offlineOnly = await this.userService.offlineOny();
    }
    if (this.offlineOnly === true) {
      return;
    }
    if (!(force || this.numberOfSyncs < 0 || this.numberOfSyncs % 2 === 0)) {
      return false;
    } else if ((await this.api.checkConnection()).status === 418) {
      return true;
    } else {
      return false;
    }
  }

  startSync() {
    this.syncIsRunning = true;
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
