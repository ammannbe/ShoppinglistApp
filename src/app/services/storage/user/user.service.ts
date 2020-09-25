import { Injectable } from '@angular/core';
import { StorageService } from './../storage.service';
import { User } from './../../../pages/user/user';

@Injectable({
  providedIn: 'root'
})
export class UserService extends StorageService {
  private key = 'user';

  public async set(user: User): Promise<User> {
    return super.set(this.key, user);
  }

  public async get(): Promise<User> {
    return super.get(this.key);
  }

  public async exists(): Promise<boolean> {
    return super.exists(this.key);
  }

  public async remove(): Promise<void> {
    super.remove(this.key);
  }
}
