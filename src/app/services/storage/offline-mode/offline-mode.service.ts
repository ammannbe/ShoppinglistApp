import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root'
})
export class OfflineModeService extends StorageService {
  private key = 'offline_mode';

  public async enable(): Promise<void> {
    this.set(this.key, true);
  }

  public async enabled(): Promise<boolean> {
    return await this.get(this.key);
  }

  public async disable(): Promise<void> {
    this.set(this.key, false);
  }

  public async remove(): Promise<void> {
    super.remove(this.key);
  }
}
