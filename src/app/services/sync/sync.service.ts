import { Injectable } from '@angular/core';
import { ApiService } from './../api/api.service';
import { OfflineModeService } from './../storage/offline-mode/offline-mode.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  protected isRunning = false;
  protected localChanges = false;
  protected remoteChanges = false;

  constructor(
    protected api: ApiService,
    protected offlineModeService: OfflineModeService
  ) {}

  public hasStarted(): boolean {
    return this.isRunning;
  }

  private async canSync(): Promise<boolean> {
    if (this.isRunning) {
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

  public async onStart(): Promise<boolean> {
    if (!(await this.canSync())) {
      return false;
    }

    this.isRunning = true;
    setTimeout(() => {
      this.onStop();
    }, 10000); // timeout after 10s

    return true;
  }

  public onStop() {
    this.isRunning = false;
  }

  protected async getLocalItems(): Promise<any[]> {
    return Promise.resolve([]);
  }

  protected async storeLocalItem(item: any): Promise<any> {
    return Promise.resolve();
  }

  protected async getRemoteItems(): Promise<any[]> {
    return Promise.resolve([]);
  }

  protected async storeRemoteItem(item: any): Promise<any> {
    return Promise.resolve();
  }

  public async sync(onlyPush = false): Promise<void> {
    if (!(await this.onStart())) {
      return;
    }

    let local = await this.getLocalItems();
    let remote = await this.getRemoteItems();

    await this.localToRemote(local, remote);

    if (onlyPush) {
      this.onStop();
      return;
    }

    if (this.localChanges) {
      local = await this.getLocalItems();
    }
    if (this.remoteChanges) {
      remote = await this.getRemoteItems();
    }
    await this.remoteToLocal(remote, local);

    this.onStop();
  }

  protected async localToRemote(local: any[], remote: any[]) {
    if (!local.length) {
      return;
    }

    const items = local.filter(l => !remote.find(r => l.name === r.name));
    for (const item of items) {
      await this.storeRemoteItem(item);
    }

    this.remoteChanges = items.length > 0;
  }

  protected async remoteToLocal(remote: any[], local: any[]) {
    if (!remote.length) {
      return;
    }

    const items = remote.filter(r => !local.find(l => r.name === l.name));
    for (const item of items) {
      await this.storeLocalItem(item);
    }

    this.localChanges = items.length > 0;
  }
}
