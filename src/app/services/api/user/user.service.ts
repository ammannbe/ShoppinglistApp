import { Injectable } from '@angular/core';

import { ApiService } from '../api.service';
import { User } from './../../storage/user/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private prefix = 'user';

  constructor(private api: ApiService) {}

  show(): Promise<User[]> {
    return this.api.get<User[]>(this.prefix);
  }

  update(user: User): Promise<User[]> {
    return this.api.patch<User[]>(this.prefix, user);
  }
}
