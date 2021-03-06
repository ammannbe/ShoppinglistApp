import { Injectable } from '@angular/core';
import { StorageService } from './../storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService extends StorageService {
  private key = 'token';

  public async set({ token }: { token: string }): Promise<string> {
    return super.set(this.key, token);
  }

  public async get(): Promise<string> {
    return super.get(this.key);
  }

  public async exists(): Promise<boolean> {
    return super.exists(this.key);
  }

  public async remove(): Promise<void> {
    super.remove(this.key);
  }
}
